import { Router } from 'express';
import ContentController from '../controllers/ContentController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.get('/contents', auth, (req, res) => ContentController.getContents(req, res));

export default router;
