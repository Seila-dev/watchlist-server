import ContentRepository from '../repositories/ContentRepository.js';
import algolia from '../utils/Algolia.js';
import { r2Storage } from '../storage/ConfigR2.js';

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

  // async listContents(userId, query) {
  //   const {
  //     status,
  //     q,
  //     category,
  //     page = 1,
  //     limit = 10,
  //     sort = 'recent',
  //   } = query;

  //   const skip = (Number(page) - 1) * Number(limit);

  //   const filters = {
  //     ownerId: userId,
  //     deletedAt: null,
  //   };

  //   if (status) filters.status = status.toUpperCase();
  //   if (category) filters.category = category.toUpperCase();
  //   if (q) {
  //     filters.OR = [
  //       { title: { contains: q, mode: 'insensitive' } },
  //       { description: { contains: q, mode: 'insensitive' } }
  //     ];
  //   }

  //   let orderBy;
  //   if (sort === 'popular') {
  //     orderBy = [
  //       { favorites: { _count: 'desc' } },
  //       { reactions: { _count: 'desc' } },
  //       { createdAt: 'desc' },
  //     ];
  //   } else if (sort === 'updated') {
  //     orderBy = { updatedAt: 'desc' };
  //   } else {
  //     orderBy = { createdAt: 'desc' };
  //   }

  //   const [items, total] = await Promise.all([
  //     ContentRepository.findAllWithPagination(filters, skip, Number(limit), orderBy),
  //     ContentRepository.count(filters),
  //   ]);

  //   return {
  //     items,
  //     page: Number(page),
  //     limit: Number(limit),
  //     total,
  //   };
  // }

   /**
   * Retorna N itens por status (paralelo, determinístico)
   * @param {string} userId
   * @param {Object} options
   * @param {string[]} options.statuses
   * @param {number} options.limitPerStatus
   * @param {string} [options.category]
   */
  async listHomeContents(userId, { statuses = [], limitPerStatus = 15, category } = {}) {
    if (!userId) throw Object.assign(new Error('userId required'), { code: 400 });

    // sanitize
    const normalizedStatuses = Array.isArray(statuses) && statuses.length > 0
      ? statuses.map(s => String(s).toUpperCase())
      : ['WATCHING', 'TO_WATCH', 'FINISHED'];

    // order: createdAt desc, id desc (determinístico)
    const orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];

    // Monta promises paralelas — para cada status pega up to limitPerStatus
    const promises = normalizedStatuses.map(async (status) => {
      const where = {
        ownerId: userId,
        deletedAt: null,
        status: status,
      };

      if (category) where.category = category;

      // Pegar items (skip=0 take=limitPerStatus)
      const itemsPromise = ContentRepository.findAllWithPagination(where, 0, Number(limitPerStatus), orderBy);

      // Opcional: contar total daquele status (útil para "ver mais")
      const countPromise = ContentRepository.count(where);

      const [items, count] = await Promise.all([itemsPromise, countPromise]);

      return {
        status,
        items,
        count,
      };
    });

    const sliders = await Promise.all(promises);

    return sliders;
  }

  // Ajuste recomendação: tornar listContents deterministic (adicionando id secondary)
  async listContents(userId, query) {
    // existing code but ensure deterministic order
    const { status, q, category, page = 1, limit = 10, sort = 'recent' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filters = { ownerId: userId, deletedAt: null };
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
        { id: 'desc' },
      ];
    } else if (sort === 'updated') {
      orderBy = [{ updatedAt: 'desc' }, { id: 'desc' }];
    } else {
      orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
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

  // Primeiro verifica se o conteúdo existe
  const content = await ContentRepository.findById(contentId);

  if (!content || content.deletedAt) {
    const error = new Error('Conteúdo não encontrado');
    error.code = 404;
    throw error;
  }

  // Verifica autorização e busca detalhes completos
  const detailedContent = await ContentRepository.findDetailsAuthorized(userId, contentId);

  if (!detailedContent) {
    const error = new Error('Acesso negado ao conteúdo');
    error.code = 403;
    throw error;
  }

  return detailedContent;
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

  async createShareLink(userId, contentId, { expiresInHours } = {}) {
    const content = await ContentRepository.findById(contentId);
    if (!content) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }
    if (content.ownerId !== userId) {
      const error = new Error('Acesso negado ao conteúdo');
      error.code = 403;
      throw error;
    }

    const tokenValue = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = typeof expiresInHours === 'number' && expiresInHours > 0
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
      : null;

    const shareToken = await ContentRepository.createShareToken({
      token: tokenValue,
      entityType: 'CONTENT',
      entityId: contentId,
      createdById: userId,
      expiresAt,
    });

    await ContentRepository.updateContentShareToken(contentId, shareToken.id);

    const base = (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/?$/, '');
    return {
      token: shareToken.token,
      shareTokenId: shareToken.id,
      expiresAt: shareToken.expiresAt,
      url: `${base}/share/${shareToken.token}`
    };
  }

  async updateContent(userId, id, data) {
    const existing = await ContentRepository.findByIdForOwnerChecks(id);
    if (!existing) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }
    if (existing.ownerId !== userId) {
      const error = new Error('Acesso negado');
      error.code = 403;
      throw error;
    }

    const updatable = {};
    const fields = ['title', 'description', 'category', 'coverUrl', 'visibility', 'status', 'rating', 'isFavorite', 'startedAt', 'finishedAt'];
    for (const key of fields) {
      if (key in data) {
        updatable[key] = data[key];
      }
    }

    if ('rating' in updatable && updatable.rating !== undefined) {
      updatable.rating = Number(updatable.rating);
    }
    if ('isFavorite' in updatable && updatable.isFavorite !== undefined) {
      updatable.isFavorite = Boolean(updatable.isFavorite);
    }
    if ('startedAt' in updatable && updatable.startedAt) {
      updatable.startedAt = new Date(updatable.startedAt);
    }
    if ('finishedAt' in updatable && updatable.finishedAt) {
      updatable.finishedAt = new Date(updatable.finishedAt);
    }

    const updated = await ContentRepository.updateById(id, updatable);

    if (algolia.enabled) {
      try {
        await algolia.partialUpdateObject({
          objectID: updated.id,
          title: updated.title,
          description: updated.description || '',
          category: updated.category,
          visibility: updated.visibility,
          updatedAt: updated.updatedAt,
        });
      } catch (e) {
        console.error('Algolia update error:', e);
      }
    }

    return updated;
  }

  async updateContentStatus(userId, id, statusInput) {
    const status = typeof statusInput === 'string'
      ? statusInput
      : (statusInput && statusInput.status);


    const existing = await ContentRepository.findByIdForOwnerChecks(id);
    if (!existing) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }
    if (existing.ownerId !== userId) {
      const error = new Error('Acesso negado');
      error.code = 403;
      throw error;
    }
    const validStatuses = ['TO_WATCH', 'WATCHING', 'FINISHED'];
    const normalized = typeof status === 'string' ? status.toUpperCase() : undefined;

    if (!validStatuses.includes(normalized)) {
      const error = new Error('Status inválido');
      error.code = 400;
      throw error;
    }
    const updated = await ContentRepository.updateById(id, { status: normalized });
    return updated;
  }

  async updateContentVisibility(userId, id, { visibility }) {
    const existing = await ContentRepository.findByIdForOwnerChecks(id);

    if (!existing) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }

    if (existing.ownerId !== userId) {
      const error = new Error('Acesso negado');
      error.code = 403;
      throw error;
    }

    const validVisibilities = ['PUBLIC', 'UNLISTED', 'PRIVATE'];
    const normalized = typeof visibility === 'string' ? visibility.toUpperCase() : null;

    if (!validVisibilities.includes(normalized)) {
      const error = new Error('Visibilidade inválida (use PUBLIC, UNLISTED ou PRIVATE)');
      error.code = 400;
      throw error;
    }

    const updated = await ContentRepository.updateById(id, { visibility: normalized });

    // Atualizar no Algolia
    if (algolia.enabled) {
      try {
        await algolia.partialUpdateObject({
          objectID: updated.id,
          visibility: updated.visibility,
          updatedAt: updated.updatedAt,
        });
      } catch (err) {
        console.error('Algolia update error (visibility):', err);
      }
    }

    return updated;
  }

  async deleteContent(userId, id) {
    const existing = await ContentRepository.findByIdForOwnerChecks(id);
    if (!existing) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }
    if (existing.ownerId !== userId) {
      const error = new Error('Acesso negado');
      error.code = 403;
      throw error;
    }

    if (existing.coverUrl && typeof existing.coverUrl === 'string') {
      try {
        const url = new URL(existing.coverUrl);
        const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        if (key) {
          await r2Storage.deleteFile(key);
        }
      } catch (_) { }
    }

    await ContentRepository.softDeleteById(id, new Date());

    if (algolia.enabled) {
      try {
        await algolia.deleteObject(id);
      } catch (e) {
        console.error('Algolia delete error:', e);
      }
    }

    return { id };
  }
}

export default new ContentService();