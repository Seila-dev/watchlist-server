import ContentRepository from '../repositories/ContentRepository.js';
import algolia from '../utils/Algolia.js';

class ContentService {
  async createContent(userId, data) {
    const {
      title,
      description,
      category,
      coverUrl,
      visibility = 'PRIVATE',
      status = 'TO_WATCH',
      rating,
      isFavorite = false,
      startedAt,
      finishedAt,
      copiedFromId,
    } = data;

    if (!title || !category) {
      const error = new Error('Campos obrigatórios ausentes: title ou category');
      error.code = 400;
      throw error;
    }

    const payload = {
      ownerId: userId,
      title,
      description,
      category,
      coverUrl,
      visibility,
      status,
      rating: rating !== undefined ? Number(rating) : undefined,
      isFavorite: Boolean(isFavorite),
      startedAt: startedAt ? new Date(startedAt) : undefined,
      finishedAt: finishedAt ? new Date(finishedAt) : undefined,
      copiedFromId,
    };

    const content = await ContentRepository.create(payload);

    if (algolia.enabled) {
      try {
        const algoliaObject = {
          objectID: content.id,
          id: content.id,
          title: content.title,
          description: content.description || '',
          category: content.category,
          tags: data.tags || [],
          visibility: content.visibility,
          ownerId: content.ownerId,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        };

        await algolia.saveObject(algoliaObject);
        console.log(`Content ${content.id} indexed successfully in Algolia`);
      } catch (error) {
        console.error('Erro ao indexar no Algolia:', error);
      }
    } else {
      console.warn('Algolia não está habilitado - conteúdo não será indexado');
    }

    return content;
  }

  async listContents(userId, query) {
    const {
      status,
      q,
      category,
      page = 1,
      limit = 10,
      sort = 'recent',
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const filters = {
      ownerId: userId,
      deletedAt: null,
    };

    if (status) filters.status = status.toUpperCase();
    if (category) filters.category = category.toUpperCase();
    if (q) {
      filters.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    let orderBy;
    if (sort === 'popular') {
      orderBy = [
        { favorites: { _count: 'desc' } },
        { reactions: { _count: 'desc' } },
        { createdAt: 'desc' },
      ];
    } else if (sort === 'updated') {
      orderBy = { updatedAt: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      ContentRepository.findAllWithPagination(filters, skip, Number(limit), orderBy),
      ContentRepository.count(filters),
    ]);

    return {
      items,
      page: Number(page),
      limit: Number(limit),
      total,
    };
  }

  async getContentById(userId, contentId) {
    if (!contentId) {
      const error = new Error('ID do conteúdo não fornecido');
      error.code = 400;
      throw error;
    }

    const content = await ContentRepository.findById(contentId);

    if (!content || content.deletedAt) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }

    if (content.ownerId !== userId) {
      const error = new Error('Acesso negado ao conteúdo');
      error.code = 403;
      throw error;
    }

    return content;
  }

  async getRecommendations(requestingUserId, contentId, { limit = 10, tags } = {}) {
    const base = await ContentRepository.findById(contentId);
    if (!base) {
      const error = new Error('Content not found');
      error.code = 404;
      throw error;
    }

    const authorized = await ContentRepository.findDetailsAuthorized(requestingUserId, contentId);
    if (!authorized) {
      const error = new Error('Access forbidden');
      error.code = 403;
      throw error;
    }

    const where = {
      ownerId: base.ownerId,
      deletedAt: null,
      category: authorized.category,
      NOT: { id: contentId },
    };

    if (Array.isArray(tags) && tags.length > 0) {
      const orContains = tags.map((t) => ({ title: { contains: t, mode: 'insensitive' } }));
      const orDesc = tags.map((t) => ({ description: { contains: t, mode: 'insensitive' } }));
      where.OR = [...orContains, ...orDesc];
    }

    try {
      if (algolia.enabled) {
        console.log('Tentando recomendações via Algolia...');

        const recommendations = await algolia.searchSimilar({
          category: authorized.category,
          tags: tags || [],
          limit: Number(limit),
        });

        console.log(`Algolia retornou ${recommendations.length} recomendações`);

        if (recommendations.length > 0) {
          const algoliaIds = recommendations
            .map(item => item.id || item.objectID)
            .filter(Boolean);

          if (algoliaIds.length > 0) {
            const orderBy = [
              { favorites: { _count: 'desc' } },
              { createdAt: 'desc' }
            ];

            const items = await ContentRepository.findManyByIds(algoliaIds, where, orderBy);

            if (items.length > 0) {
              console.log(`Retornando ${items.length} recomendações do Algolia`);
              return items.slice(0, Number(limit));
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro nas recomendações do Algolia:', error);
    }

    console.log('Usando fallback para recomendações...');
    const fallbackItems = await ContentRepository.findAllWithPagination(
      where,
      0,
      Number(limit),
      [{ favorites: { _count: 'desc' } }, { createdAt: 'desc' }]
    );

    console.log(`Retornando ${fallbackItems.length} recomendações do fallback`);
    return fallbackItems;
  }

  async reindexAllContent() {
    if (!algolia.enabled) {
      throw new Error('Algolia not enabled');
    }

    try {
      const allContent = await ContentRepository.findAllWithPagination({
        deletedAt: null,
        visibility: { in: ['PUBLIC', 'PRIVATE'] }
      });

      if (allContent.length === 0) {
        return { message: 'No content to index', count: 0 };
      }

      const algoliaObjects = allContent.map(content => ({
        objectID: content.id,
        id: content.id,
        title: content.title,
        description: content.description || '',
        category: content.category,
        tags: [], // Adicionar tags para os conteúdos futuramente
        visibility: content.visibility,
        ownerId: content.ownerId,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      }));

      await algolia.clearIndex();

      const batchSize = 100;
      let indexedCount = 0;

      for (let i = 0; i < algoliaObjects.length; i += batchSize) {
        const batch = algoliaObjects.slice(i, i + batchSize);
        await algolia.batchSaveObjects(batch);
        indexedCount += batch.length;
        console.log(`Indexed ${indexedCount}/${algoliaObjects.length} contents`);
      }

      return {
        message: 'Content reindexed successfully',
        count: indexedCount,
        total: allContent.length
      };

    } catch (error) {
      console.error('Error reindexing content:', error);
      throw error;
    }
  }
}

export default new ContentService();