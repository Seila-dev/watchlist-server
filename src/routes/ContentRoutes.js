import { Router } from 'express';
import ContentController from '../controllers/ContentController.js';
import auth from '../middlewares/Auth.js';

const router = Router();

router.get(
    '/contents', 
    auth, 
    (req, res) => ContentController.getContents(req, res)
);

router.get(
    '/contents/:id/recommendations',
    auth,
    (req, res) => ContentController.getRecommendations(req, res)
);

router.get(
    '/contents/:category', 
    auth, 
    (req, res) => ContentController.getContentsByCategory(req, res)
);

router.get(
    '/contents/:id',
    auth,
    (req, res) => ContentController.getContentById(req, res)
);

export default router;