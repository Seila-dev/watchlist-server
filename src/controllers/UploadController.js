import { r2Storage } from '../storage/ConfigR2.js';
import { prisma } from '../database/client.js';

export const fakeAuth = (req, res, next) => {
  req.user = { id: 1 }; // mock de usuário
  next();
};
// import { logger } from '../utils/logger.js';

// Upload de arquivo único
export const uploadFile = async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      error: 'No file provided',
      message: 'Please select a file to upload'
    });
    return
  }

  const { originalname, buffer, mimetype, size } = req.file;
  const userId = req.user?.id;

  // Determinar pasta baseada no tipo de arquivo
  let folder = 'misc';
  if (mimetype.startsWith('image/')) {
    folder = 'images';
  } else if (mimetype.startsWith('video/')) {
    folder = 'videos';
  } else if (mimetype === 'application/pdf') {
    folder = 'documents';
  }

  try {
    // Upload para R2
    const { url, key } = await r2Storage.upload(
      originalname,
      buffer,
      mimetype,
      folder,
      {
        metadata: {
          uploadedBy: userId,
          originalName: originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    );

    // Salvar no banco de dados
    const media = await prisma.media.create({
      data: {
        url,
        filename: key,
        mimetype,
        size,
        uploadedById: userId
      }
    });

    // logger.info(`File uploaded successfully: ${key} by user ${userId}`);

    res.json({
      id: media.id,
      url,
      key,
      filename: originalname,
      mimetype,
      size,
      uploadedAt: media.createdAt
    });

  } catch (error) {
    // logger.error('Error uploading file:', error);
    
    if (error.message.includes('File type') || error.message.includes('not allowed')) {
      res.status(400).json({
        error: 'Invalid file type',
        message: error.message
      });
      return
    }

    throw error;
  }
};

// Deletar arquivo
export const deleteFile = async (req, res) => {
  const { key } = req.params;
  const userId = req.user.id;

  try {
    // Verificar se o arquivo existe no banco e pertence ao usuário
    const media = await prisma.media.findFirst({
      where: {
        filename: key,
        uploadedById: userId
      }
    });

    if (!media) {
      return res.status(404).json({
        error: 'File not found',
        message: 'File not found or access denied'
      });
    }

    // Deletar do R2
    await r2Storage.deleteFile(key);

    // Deletar do banco
    await prisma.media.delete({
      where: { id: media.id }
    });

    // logger.info(`File deleted successfully: ${key} by user ${userId}`);

    res.json({
      message: 'File deleted successfully',
      key
    });

  } catch (error) {
    // logger.error('Error deleting file:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    throw error;
  }
};

// Listar arquivos do usuário
export const getUserFiles = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const userId = req.user.id;

  const where = {
    uploadedById: userId
  };

  // Filtro por tipo de arquivo
  if (type) {
    const typeMap = {
      image: 'image/',
      video: 'video/',
      document: 'application/',
      pdf: 'application/pdf'
    };

    if (typeMap[type]) {
      where.mimetype = {
        startsWith: typeMap[type]
      };
    }
  }

  const orderBy = {
    [sortBy]: sortOrder.toLowerCase()
  };

  try {
    const [files, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take
      }),
      prisma.media.count({ where })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      data: files,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    // logger.error('Error getting user files:', error);
    throw error;
  }
};