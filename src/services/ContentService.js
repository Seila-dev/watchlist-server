import ContentRepository from '../repositories/ContentRepository.js';

class ContentService {
  async listContents(userId, query) {
    const {
      status,
      q,
      category,
      page = 1,
      limit = 10,
      sort = 'recent | popular | updated',
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const filters = {
      ownerId: userId,
      deletedAt: null,
    };

    if (status) filters.status = status.toUpperCase();
    if (category) filters.category = category.toUpperCase();
    if (q) filters.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];

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
      orderBy = { createdAt: 'desc' }; // recent
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

  async getRecommendations(requestingUserId, contentId, { limit = 10, tags } = {}) {
    const base = await ContentRepository.findById(contentId);
    if (!base) {
      const error = new Error('Not Found');
      error.code = 404;
      throw error;
    }

    const authorized = await ContentRepository.findDetailsAuthorized(requestingUserId, contentId);
    if (!authorized) {
      const error = new Error('Forbidden');
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

    const items = await ContentRepository.findAllWithPagination(
      where,
      0,
      Number(limit),
      [{ favorites: { _count: 'desc' } }, { createdAt: 'desc' }]
    );

    return items;
  }
}

export default new ContentService();
