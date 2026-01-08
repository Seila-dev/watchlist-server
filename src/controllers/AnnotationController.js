import AnnotationService from '../services/AnnotationService.js';

class AnnotationController {
  // POST /contents/:contentId/annotations - Criar anotação
  async createAnnotation(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { contentId } = req.params;
      const body = req.body || {};

      try {
        const annotation = await AnnotationService.createAnnotation(userId, contentId, body);
        return res.status(201).json(annotation);
      } catch (error) {
        if (error?.code === 400) {
          return res.status(400).json({ error: error.message || 'Dados inválidos' });
        }
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Conteúdo não encontrado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('POST /contents/:contentId/annotations error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /contents/:contentId/annotations - Listar anotações de um conteúdo
  async getAnnotationsByContent(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { contentId } = req.params;
      const { skip, take } = req.query;

      const options = {};
      if (skip) options.skip = parseInt(skip);
      if (take) options.take = parseInt(take);

      try {
        const annotations = await AnnotationService.getAnnotationsByContent(
          userId,
          contentId,
          options
        );
        return res.status(200).json({ items: annotations, count: annotations.length });
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        throw error;
      }
    } catch (error) {
      console.error('GET /contents/:contentId/annotations error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /annotations/history - Histórico de anotações do usuário (perfil)
  async getUserAnnotationHistory(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { skip, take = 15 } = req.query;

      const options = {
        take: parseInt(take),
      };
      if (skip) options.skip = parseInt(skip);

      const annotations = await AnnotationService.getUserAnnotationHistory(userId, options);
      return res.status(200).json({ items: annotations, count: annotations.length });
    } catch (error) {
      console.error('GET /annotations/history error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /annotations/:id - Obter detalhes de uma anotação
  async getAnnotationById(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;

      try {
        const annotation = await AnnotationService.getAnnotationById(userId, id);
        return res.status(200).json(annotation);
      } catch (error) {
        if (error?.code === 404) {
          return res.status(404).json({
            error: error.message || 'Anotação não encontrada',
          });
        }
        throw error;
      }
    } catch (error) {
      console.error('GET /annotations/:id error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PATCH /annotations/:id - Atualizar anotação
  async updateAnnotation(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;
      const body = req.body || {};

      try {
        const updated = await AnnotationService.updateAnnotation(userId, id, body);
        return res.status(200).json(updated);
      } catch (error) {
        if (error?.code === 400) {
          return res.status(400).json({ error: error.message || 'Dados inválidos' });
        }
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('PATCH /annotations/:id error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PATCH /annotations/:id/pin - Fixar/desfixar anotação
  async togglePinAnnotation(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;

      try {
        const updated = await AnnotationService.togglePinAnnotation(userId, id);
        return res.status(200).json(updated);
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('PATCH /annotations/:id/pin error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE /annotations/:id - Deletar anotação
  async deleteAnnotation(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;

      try {
        const result = await AnnotationService.deleteAnnotation(userId, id);
        return res.status(200).json({ success: true, ...result });
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('DELETE /annotations/:id error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /annotations/:id/share-link - Criar link de compartilhamento
  async createShareLink(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;
      const { expiresInHours } = req.body || {};

      try {
        const result = await AnnotationService.createShareLink(userId, id, {
          expiresInHours: typeof expiresInHours === 'number' ? expiresInHours : undefined,
        });
        return res.status(201).json(result);
      } catch (error) {
        if (error?.code === 400) {
          return res.status(400).json({ error: error.message || 'Requisição inválida' });
        }
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('POST /annotations/:id/share-link error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /annotations/:id/copy - Copiar anotação
  async copyAnnotation(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;

      try {
        const copied = await AnnotationService.copyAnnotation(userId, id);
        return res.status(201).json(copied);
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: error.message || 'Acesso negado' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('POST /annotations/:id/copy error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /annotations/:id/reactions - Adicionar reação
  async addReaction(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;
      const { emoji } = req.body || {};

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji é obrigatório' });
      }

      try {
        const reaction = await AnnotationService.addReaction(userId, id, emoji);
        return res.status(201).json(reaction);
      } catch (error) {
        if (error?.code === 400) {
          return res.status(400).json({ error: error.message || 'Dados inválidos' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('POST /annotations/:id/reactions error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE /annotations/:id/reactions/:emoji - Remover reação
  async removeReaction(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id, emoji } = req.params;

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji é obrigatório' });
      }

      try {
        const result = await AnnotationService.removeReaction(userId, id, emoji.toUpperCase());
        return res.status(200).json(result);
      } catch (error) {
        if (error?.code === 400) {
          return res.status(400).json({ error: error.message || 'Dados inválidos' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('DELETE /annotations/:id/reactions/:emoji error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /annotations/:id/reactions - Listar reações de uma anotação
  async getAnnotationReactions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;

      try {
        const reactions = await AnnotationService.getAnnotationReactions(userId, id);
        return res.status(200).json({ items: reactions, count: reactions.length });
      } catch (error) {
        if (error?.code === 404) {
          return res.status(404).json({ error: error.message || 'Anotação não encontrada' });
        }
        throw error;
      }
    } catch (error) {
      console.error('GET /annotations/:id/reactions error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new AnnotationController();