import dotenv from 'dotenv';
dotenv.config();

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { logger } from '../utils/logger.js';
import crypto from 'crypto';
import path from 'path';

class R2Storage {
  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    
    this.bucket = process.env.R2_BUCKET;
    this.accountId = process.env.R2_ACCOUNT_ID;
    this.publicUrl = process.env.R2_PUBLIC_URL || 
      `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}`;
  }

  /**
   * @param {string} originalName - Nome original do arquivo
   * @param {string} folder - Pasta onde armazenar (opcional)
   * @returns {string} Chave única do arquivo
   */
  generateKey(originalName, folder = '') {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    const sanitizedName = baseName
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    
    const fileName = `${timestamp}-${randomHash}-${sanitizedName}${extension}`;
    
    return folder ? `${folder}/${fileName}` : fileName;
  }

  /**
   * Faz upload de um arquivo para o R2
   * @param {string} key - Chave do arquivo
   * @param {Buffer} buffer - Buffer do arquivo
   * @param {string} contentType - Tipo MIME do arquivo
   * @param {Object} options - Opções adicionais
   * @returns {Promise<{url: string, key: string}>}
   */
  async uploadFile(key, buffer, contentType, options = {}) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: options.cacheControl || 'public, max-age=31536000', // 1 ano
        Metadata: options.metadata || {},
        ...options.additionalParams
      });

      await this.client.send(command);
      
      const url = `${this.publicUrl}/${key}`;
      
      // logger.info(`File uploaded successfully: ${key}`);
      
      return { url, key };
      
    } catch (error) {
      // logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload com chave gerada automaticamente
   * @param {string} originalName - Nome original do arquivo
   * @param {Buffer} buffer - Buffer do arquivo
   * @param {string} contentType - Tipo MIME
   * @param {string} folder - Pasta de destino
   * @param {Object} options - Opções adicionais
   * @returns {Promise<{url: string, key: string}>}
   */
  async upload(originalName, buffer, contentType, folder = '', options = {}) {
    const key = this.generateKey(originalName, folder);
    return this.uploadFile(key, buffer, contentType, options);
  }

  /**
   * Gera URL assinada para acesso privado
   * @param {string} key - Chave do arquivo
   * @param {number} expiresIn - Tempo de expiração em segundos (default: 1 hora)
   * @returns {Promise<string>} URL assinada
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      // logger.debug(`Generated signed URL for: ${key}`);
      
      return url;
      
    } catch (error) {
      // logger.error(`Failed to generate signed URL for ${key}:`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Verifica se um arquivo existe
   * @param {string} key - Chave do arquivo
   * @returns {Promise<boolean>}
   */
  async fileExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
      
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      // logger.error(`Error checking file existence ${key}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um arquivo
   * @param {string} key - Chave do arquivo
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      
      // logger.info(`File deleted successfully: ${key}`);
      
      return true;
      
    } catch (error) {
      // logger.error(`Failed to delete file ${key}:`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Obtém informações de um arquivo
   * @param {string} key - Chave do arquivo
   * @returns {Promise<Object>} Metadata do arquivo
   */
  async getFileInfo(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      
      return {
        key,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        etag: response.ETag,
        metadata: response.Metadata
      };
      
    } catch (error) {
      // logger.error(`Failed to get file info for ${key}:`, error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Obtém URL público de um arquivo
   * @param {string} key - Chave do arquivo
   * @returns {string} URL público
   */
  getPublicUrl(key) {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Valida configuração do R2
   * @returns {boolean}
   */
  isConfigured() {
    const requiredEnvVars = [
      'R2_ENDPOINT',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET',
      'R2_ACCOUNT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      // logger.error(`Missing R2 configuration: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }
}

export const r2Storage = new R2Storage();

export { R2Storage };


export default r2Storage;