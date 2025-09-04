import express from 'express';
import cors from 'cors';
import contentRoutes from './routes/ContentRoutes.js';
import { uploadTestRoutes } from './routes/UploadRoutesTest.js'

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', contentRoutes);
app.use('/images', uploadTestRoutes)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
