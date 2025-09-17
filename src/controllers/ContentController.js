import ContentService from '../services/ContentService.js';

const categoryMap = {
  filmes: 'MOVIES',
  series: 'SERIES',
  animes: 'ANIMES',
  livros: 'BOOKS',
  mangas: 'MANGAS',
};

class ContentController {
  async getContents(req, res) {
    try {
      const userId = req.user?.id; // vem do middleware auth
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = await ContentService.listContents(userId, req.query);
      return res.status(200).json(data);
    } catch (error) {
      console.error('GET /contents error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getContentsByCategory(req, res) {
    try {
      const userId = req.user?.id; 
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { category: categorySlug } = req.params;
      const category = categoryMap[categorySlug.toLowerCase()];

      if (!category) {
        return res.status(400).json({ error: 'Categoria inválida.' });
      }

      const query = { ...req.query, category };

      const data = await ContentService.listContents(userId, query);
      return res.status(200).json(data);
    } catch (error) {
      console.error(`GET /contents/:category (${req.params.category}) error:`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  async getContentById(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      const { id } = req.params;
      let content;
      try {
        content = await ContentService.getContentById(userId, id);
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: 'Acesso negado!' });
        }
        throw error;
      }

      if (!content) {
        return res.status(404).json({ error: 'Conteúdo não encontrado.' });
      }

      return res.status(200).json(content);
    } catch (error) {
      console.error(`GET /contents/${req.params.id} error:`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getRecommendations(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }
      const { id } = req.params;
      const { limit = 10, tags } = req.query;

      let items;
      try {
        items = await ContentService.getRecommendations(userId, id, {
          limit: Number(limit),
          tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        });
      } catch (error) {
        if (error?.code === 403) {
          return res.status(403).json({ error: 'Acesso negado!' });
        }
        if (error?.code === 404) {
          return res.status(404).json({ error: 'Conteúdo não encontrado.' });
        }
        throw error;
      }

      return res.status(200).json({ items });
    } catch (error) {
      console.error(`GET /contents/${req.params.id}/recommendations error:`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ContentController();