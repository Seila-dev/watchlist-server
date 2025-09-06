import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';
import { fakeAuth } from './controllers/UploadController.js';

// Importar configurações e middlewares
// import { logger } from './utils/logger.js';
// import { errorHandler } from './middlewares/Auth.js';
// import { requestLogger } from './middlewares/Auth.js';

// Importar rotas
import contentRoutes from './routes/contentRoutes.js';
import uploadRoutes from './routes/UploadRoutesTest.js';

// Configurar dotenv
// dotenv.config();

export const app = express();

// Configuração de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Middlewares básicos
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
// app.use(requestLogger);

// Rotas
// app.use('/api/health', healthRoutes);
app.use('/content', contentRoutes);
app.use('/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler global
// app.use(errorHandler);

app.use(fakeAuth);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;