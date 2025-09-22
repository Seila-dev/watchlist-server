import ContentService from '../services/ContentService.js';
import algolia from '../utils/Algolia.js';

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
      const userId = req.user?.id;
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
        return res.status(400).json({ 
          error: 'Categoria inválida.',
          validCategories: Object.keys(categoryMap)
        });
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
        if (error?.code === 404) {
          return res.status(404).json({ error: 'Conteúdo não encontrado.' });
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

      return res.status(200).json({ 
        items,
        count: items.length,
        algoliaEnabled: algolia.enabled 
      });
    } catch (error) {
      console.error(`GET /contents/${req.params.id}/recommendations error:`, error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async testAlgolia(req, res) {
    try {
      const { category, tags, limit, testSearch, reindex } = req.query;

      // Teste básico de conectividade
      const connectionTest = await algolia.testConnection();
      
      const testResult = {
        timestamp: new Date().toISOString(),
        connection: connectionTest,
        environment: {
          ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID ? `${process.env.ALGOLIA_APP_ID.substring(0, 8)}...` : 'NOT_SET',
          ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY ? 'SET' : 'NOT_SET',
          ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME || 'contents (default)'
        }
      };

      if (!algolia.enabled) {
        return res.status(200).json({
          ...testResult,
          status: 'disabled',
          message: 'Algolia não está configurado (verifique as variáveis de ambiente)'
        });
      }

      if (reindex === 'true') {
        try {
          const reindexResult = await ContentService.reindexAllContent();
          testResult.reindex = reindexResult;
        } catch (reindexError) {
          testResult.reindex = {
            error: reindexError.message,
            success: false
          };
        }
      }

      if (testSearch !== 'false') {
        try {
          const searchParams = {
            category: category || 'MOVIES',
            tags: tags ? tags.split(',').map(t => t.trim()) : ['action', 'drama'],
            limit: parseInt(limit) || 5
          };

          const searchResults = await algolia.searchSimilar(searchParams);
          
          testResult.search = {
            params: searchParams,
            results: searchResults,
            count: searchResults.length,
            success: true
          };

          const querySearchResults = await algolia.search({
            query: 'test',
            limit: 3
          });

          testResult.querySearch = {
            query: 'test',
            results: querySearchResults.hits,
            totalHits: querySearchResults.nbHits,
            success: true
          };

        } catch (searchError) {
          testResult.search = {
            success: false,
            error: searchError.message,
            code: searchError.code
          };
        }
      }

      try {
        const settings = await algolia.getSettings();
        testResult.indexSettings = {
          success: true,
          hasSettings: !!settings,
          settingsKeys: settings ? Object.keys(settings) : []
        };
      } catch (settingsError) {
        testResult.indexSettings = {
          success: false,
          error: settingsError.message
        };
      }

      const statusCode = connectionTest.success ? 200 : 500;

      return res.status(statusCode).json({
        ...testResult,
        status: connectionTest.success ? 'operational' : 'error',
        message: connectionTest.success 
          ? 'Algolia está funcionando corretamente!' 
          : 'Problemas na conexão com o Algolia'
      });

    } catch (error) {
      console.error('Test Algolia error:', error);
      return res.status(500).json({ 
        status: 'error',
        error: 'Erro ao testar Algolia',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async reindexContent(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      // Verificar se o usuário tem permissão (adminAuth futuramente)
      // if (!req.user.isAdmin) {
      //   return res.status(403).json({ error: 'Acesso negado! Apenas administradores.' });
      // }

      if (!algolia.enabled) {
        return res.status(400).json({ 
          error: 'Algolia não está habilitado',
          message: 'Verifique as configurações do Algolia'
        });
      }

      const result = await ContentService.reindexAllContent();
      
      return res.status(200).json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Reindex content error:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao reindexar conteúdo',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async searchAlgolia(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Não autorizado!' });
      }

      if (!algolia.enabled) {
        return res.status(400).json({ 
          error: 'Algolia não está habilitado' 
        });
      }

      const { 
        q = '', 
        category, 
        tags, 
        limit = 10, 
        page = 0,
        filters 
      } = req.query;

      let searchFilters = filters || '';
      
      if (category) {
        searchFilters += (searchFilters ? ' AND ' : '') + `category:"${category}"`;
      }

      const searchParams = {
        query: q,
        filters: searchFilters,
        limit: parseInt(limit),
        offset: parseInt(page) * parseInt(limit)
      };

      const results = await algolia.search(searchParams);

      let similarityResults = null;
      if (tags) {
        const tagsList = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsList.length > 0) {
          similarityResults = await algolia.searchSimilar({
            category,
            tags: tagsList,
            limit: parseInt(limit)
          });
        }
      }

      return res.status(200).json({
        search: {
          params: searchParams,
          results: results.hits,
          totalHits: results.nbHits,
          page: results.page,
          totalPages: results.nbPages,
          processingTime: results.processingTimeMS
        },
        similarity: similarityResults ? {
          params: { category, tags: tags?.split(',') },
          results: similarityResults,
          count: similarityResults.length
        } : null,
        algoliaEnabled: true,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Algolia direct search error:', error);
      return res.status(500).json({
        error: 'Erro na busca do Algolia',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ContentController();