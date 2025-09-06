// import { Router } from 'express'
// import multer from 'multer'
// import { uploadToR2 } from '../storage/ConfigR2.js'

// export const uploadTestRoutes = Router();
// const upload = multer({ storage: multer.memoryStorage() });

// uploadTestRoutes.post(
//     "/upload",
//     upload.single("file"),
//     async (req, res) => {
//         try {
//             const file = req.file;
//             const url = await uploadToR2(
//                 `${Date.now()}-${file.originalname}`,
//                 file.buffer,
//                 file.mimetype
//             )
//             res.json({ url });
//         } catch (error) {
//             console.log(error)
//             res.status(500).json({ error: "Upload failed somehow "})
//         }
//     }
// )

import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middlewares/Auth.js';
import { uploadFile, deleteFile } from '../controllers/UploadController.js';
// import { logger } from '../utils/logger.js';

const router = Router();

// Configuração do multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5 // Máximo 5 arquivos por vez
  },
  onError: (err, next) => {
    // logger.error('Multer error:', err);
    next(err);
  }
});

// Middleware para tratar erros do multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 50MB'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 5 files allowed'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field'
      });
    }
  }
  
  if (err.message.includes('File type') && err.message.includes('not allowed')) {
    res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }
  
  next(err);
};

// Rotas de upload
router.post(
  '/single',
  // auth,
  upload.single('file'),
  handleMulterError,
  asyncHandler(uploadFile)
);

router.post(
  '/multiple',
  // auth,
  upload.array('files', 5),
  handleMulterError,
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        error: 'No files provided',
        message: 'Please select files to upload'
      });
    }

    const results = [];
    const errors = [];

    // Upload cada arquivo
    for (const file of req.files) {
      try {
        // Simular req.file para o controller
        req.file = file;
        const mockRes = {
          json: (data) => data,
          status: () => mockRes
        };
        
        const result = await uploadFile(req, mockRes);
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      res.status(400).json({
        error: 'All uploads failed',
        details: errors
      });
    }

    res.json({
      message: 'Upload completed',
      results,
      ...(errors.length > 0 && { errors })
    });
  })
);

// Rota para deletar arquivo
router.delete(
  '/:key',
  // auth,
  asyncHandler(deleteFile)
);

// Rota para obter informações de arquivo
router.get(
  '/info/:key',
  // auth,
  asyncHandler(async (req, res) => {
    const { r2Storage } = await import('../storage/ConfigR2.js');
    
    try {
      const info = await r2Storage.getFileInfo(req.params.key);
      res.json(info);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'File not found'
        });
      }
      throw error;
    }
  })
);

// Rota para gerar URL assinada
router.get(
  '/signed/:key',
  // auth,
  asyncHandler(async (req, res) => {
    const { r2Storage } = await import('../storage/r2Storage.js');
    const expiresIn = parseInt(req.query.expires) || 3600; // 1 hora default
    
    try {
      const url = await r2Storage.getSignedUrl(req.params.key, expiresIn);
      res.json({ 
        url,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'File not found'
        });
      }
      throw error;
    }
  })
);

export default router;