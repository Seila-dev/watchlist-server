// // Auth middleware (placeholder para integração com Java)
// export const auth = (req, res, next) => {
//   try {
//     // TODO: Implementar integração com sistema de autenticação Java
//     // Por enquanto, usar um user.id mockado para desenvolvimento
    
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader) {
//       return res.status(401).json({
//         error: 'Authorization header required'
//       });
//     }

//     const token = authHeader.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({
//         error: 'Token required'
//       });
//     }

//     // Mock user para desenvolvimento - SUBSTITUIR pela integração real
//     if (process.env.NODE_ENV === 'development') {
//       req.user = {
//         id: 'mock-user-id',
//         email: 'mock@example.com',
//         username: 'mockuser'
//       };
//       return next();
//     }

//     // TODO: Validar token com o sistema Java
//     // Fazer requisição para API Java para validar o token
//     // e obter informações do usuário
    
//     // Por enquanto, retornar erro em produção
//     return res.status(401).json({
//       error: 'Authentication not implemented'
//     });
    
//   } catch (error) {
//     return res.status(401).json({
//       error: 'Invalid token'
//     });
//   }
// };

// // Middleware opcional de auth (não bloqueia se não autenticado)
// export const optionalAuth = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (authHeader) {
//       const token = authHeader.replace('Bearer ', '');
      
//       if (token && process.env.NODE_ENV === 'development') {
//         req.user = {
//           id: 'mock-user-id',
//           email: 'mock@example.com',
//           username: 'mockuser'
//         };
//       }
//     }
    
//     next();
//   } catch (error) {
//     // Em caso de erro, continua sem usuário
//     next();
//   }
// };

// // Error handler middleware
// export const errorHandler = async (err, req, res, next) => {
//   const { logger } = await import('../utils/logger.js');
  
//   logger.error('Error caught by error handler:', {
//     error: err.message,
//     stack: err.stack,
//     url: req.url,
//     method: req.method,
//     ip: req.ip,
//     userAgent: req.get('User-Agent')
//   });

//   // Prisma errors
//   if (err.code === 'P2002') {
//     return res.status(400).json({
//       error: 'Duplicate entry',
//       message: 'This record already exists'
//     });
//   }

//   if (err.code === 'P2025') {
//     return res.status(404).json({
//       error: 'Not found',
//       message: 'Record not found'
//     });
//   }

//   // Multer errors
//   if (err.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({
//       error: 'File too large',
//       message: 'File size exceeds the limit'
//     });
//   }

//   // Validation errors
//   if (err.isJoi) {
//     return res.status(400).json({
//       error: 'Validation error',
//       message: err.details[0].message
//     });
//   }

//   // Default error
//   const status = err.status || err.statusCode || 500;
//   const message = process.env.NODE_ENV === 'production' 
//     ? 'Internal server error' 
//     : err.message;

//   res.status(status).json({
//     error: message,
//     ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
//   });
// };

// // Request logger middleware
// export const requestLogger = (req, res, next) => {
//   const start = Date.now();
  
//   res.on('finish', async () => {
//     const { logger } = await import('../utils/logger.js');
//     const duration = Date.now() - start;
    
//     logger.http(`${req.method} ${req.originalUrl}`, {
//       method: req.method,
//       url: req.originalUrl,
//       status: res.statusCode,
//       duration: `${duration}ms`,
//       ip: req.ip,
//       userAgent: req.get('User-Agent')
//     });
//   });
  
//   next();
// };

// // Validation middleware factory
// export const validate = (schema, property = 'body') => {
//   return (req, res, next) => {
//     const { error } = schema.validate(req[property]);
    
//     if (error) {
//       return res.status(400).json({
//         error: 'Validation error',
//         message: error.details[0].message,
//         details: error.details
//       });
//     }
    
//     next();
//   };
// };

// Async handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// // Content ownership middleware
// export const checkContentOwnership = async (req, res, next) => {
//   try {
//     const { prisma } = await import('../database/index.js');
//     const contentId = req.params.id || req.params.contentId;
//     const userId = req.user.id;

//     const content = await prisma.content.findFirst({
//       where: {
//         id: contentId,
//         ownerId: userId
//       }
//     });

//     if (!content) {
//       return res.status(404).json({
//         error: 'Content not found or access denied'
//       });
//     }

//     req.content = content;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Cache middleware
// export const cache = (duration = 300) => { // 5 minutos default
//   return async (req, res, next) => {
//     if (req.method !== 'GET') {
//       return next();
//     }

//     try {
//       const redis = (await import('../queue/redis.js')).default;
      
//       if (!redis.isConnected) {
//         return next();
//       }

//       const key = `cache:${req.originalUrl}`;
//       const cached = await redis.get(key);

//       if (cached) {
//         return res.json(cached);
//       }

//       // Override res.json to cache the response
//       const originalJson = res.json;
//       res.json = function(data) {
//         redis.set(key, data, { ex: duration }).catch(() => {}); // Fail silently
//         originalJson.call(this, data);
//       };

//       next();
//     } catch (error) {
//       // Fail silently and continue without caching
//       next();
//     }
//   };
// };