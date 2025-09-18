import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import { logger } from './utils/logger.js';
// import { errorHandler } from './middlewares/Auth.js';
// import { requestLogger } from './middlewares/Auth.js';

// Importar rotas
import contentRoutes from './routes/ContentRoutes.js';
import usersRoutes from './routes/UsersRoutes.js';
import authRouter from './routes/AuthRoutes.js'

export const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-watchlist.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
// app.use(requestLogger);

// Rotas
app.use('/content', contentRoutes);
app.use("/auth", authRouter)
app.use("/users", usersRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler global
// app.use(errorHandler);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

export default app;