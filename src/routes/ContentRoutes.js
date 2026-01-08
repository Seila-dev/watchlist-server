import { Router } from 'express';
import ContentController from '../controllers/ContentController.js';
import AnnotationController from '../controllers/AnnotationController.js';
import auth from '../middlewares/Auth.js';

const router = Router();

router.get(
  '/algolia/test',
  auth,
  (req, res) => ContentController.testAlgolia(req, res)
);

router.post(
  '/algolia/reindex',
  auth,
  (req, res) => ContentController.reindexContent(req, res)
);

router.get(
  '/algolia/search',
  auth,
  (req, res) => ContentController.searchAlgolia(req, res)
);

router.get(
  '/category/:category', 
  auth, 
  (req, res) => ContentController.getContentsByCategory(req, res)
);

router.get(
  '/home',
  auth,
  (req, res) => ContentController.getHomeContents(req, res)
);

router.post(
  '/:contentId/annotations',
  auth,
  (req, res) => AnnotationController.createAnnotation(req, res)
);

// Listar anotações de um conteúdo
router.get(
  '/:contentId/annotations',
  auth,
  (req, res) => AnnotationController.getAnnotationsByContent(req, res)
);

router.get(
  '/:id/recommendations',
  auth,
  (req, res) => ContentController.getRecommendations(req, res)
);

router.post(
  '/:id/share-link',
  auth,
  (req, res) => ContentController.createShareLink(req, res)
);

router.patch(
  '/:id/status',
  auth,
  (req, res) => ContentController.updateContentStatus(req, res)
);

router.patch(
  '/:id/visibility',
  auth,
  (req, res) => ContentController.updateContentVisibility(req, res)
);

router.get(
  '/', 
  auth, 
  (req, res) => ContentController.getContents(req, res)
);

router.get(
  '/:id',
  auth,
  (req, res) => ContentController.getContentById(req, res)
);

router.post(
  '/',
  auth,
  (req, res) => ContentController.createContent(req, res)
);

router.patch(
  '/:id',
  auth,
  (req, res) => ContentController.updateContent(req, res)
);

router.delete(
  '/:id',
  auth,
  (req, res) => ContentController.deleteContent(req, res)
);

export default router;