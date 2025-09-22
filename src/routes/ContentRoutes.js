import { Router } from 'express';
import ContentController from '../controllers/ContentController.js';
import auth from '../middlewares/Auth.js';

const router = Router();

router.get(
  '/', 
  auth, 
  (req, res) => ContentController.getContents(req, res)
);

router.get(
  '/:id/recommendations',
  auth,
  (req, res) => ContentController.getRecommendations(req, res)
);

router.get(
  '/category/:category', 
  auth, 
  (req, res) => ContentController.getContentsByCategory(req, res)
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

router.post(
  '/:id/share-link',
  auth,
  (req, res) => ContentController.createShareLink(req, res)
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

// Algolia end-points

// Testar configuração do Algolia
router.get(
  '/algolia/test',
  auth,
  // adminAuth,
  (req, res) => ContentController.testAlgolia(req, res)
);

// Reindexar todos os conteúdos no Algolia
router.post(
  '/algolia/reindex',
  auth,
  // adminAuth,
  (req, res) => ContentController.reindexContent(req, res)
);

// Busca direta no Algolia (para debugging)
router.get(
  '/algolia/search',
  auth,
  // adminAuth,
  (req, res) => ContentController.searchAlgolia(req, res)
);

export default router;