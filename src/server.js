import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/ContentRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', contentRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
