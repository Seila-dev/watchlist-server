import { Router } from 'express';
import AnnotationController from '../controllers/AnnotationController.js';
import auth from '../middlewares/Auth.js';

const router = Router();

// Histórico de anotações do usuário (perfil)
router.get(
  '/history',
  auth,
  (req, res) => AnnotationController.getUserAnnotationHistory(req, res)
);

// Obter detalhes de uma anotação específica
router.get(
  '/:id',
  auth,
  (req, res) => AnnotationController.getAnnotationById(req, res)
);

// Atualizar anotação
router.patch(
  '/:id',
  auth,
  (req, res) => AnnotationController.updateAnnotation(req, res)
);

// Fixar/desfixar anotação
router.patch(
  '/:id/pin',
  auth,
  (req, res) => AnnotationController.togglePinAnnotation(req, res)
);

// Deletar anotação
router.delete(
  '/:id',
  auth,
  (req, res) => AnnotationController.deleteAnnotation(req, res)
);

// Criar link de compartilhamento
router.post(
  '/:id/share-link',
  auth,
  (req, res) => AnnotationController.createShareLink(req, res)
);

// Copiar anotação
router.post(
  '/:id/copy',
  auth,
  (req, res) => AnnotationController.copyAnnotation(req, res)
);

// Adicionar reação
router.post(
  '/:id/reactions',
  auth,
  (req, res) => AnnotationController.addReaction(req, res)
);

// Remover reação
router.delete(
  '/:id/reactions/:emoji',
  auth,
  (req, res) => AnnotationController.removeReaction(req, res)
);

// Listar reações de uma anotação
router.get(
  '/:id/reactions',
  auth,
  (req, res) => AnnotationController.getAnnotationReactions(req, res)
);

export default router;