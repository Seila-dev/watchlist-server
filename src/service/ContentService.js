import ContentRepository from '../repositories/ContentRepository.js';

class ContentService {
  async listContents(userId, query) {
    const {
      status,
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

    const orderBy =
      sort === 'updated'
        ? { updatedAt: 'desc' }
        : { createdAt: 'desc' };

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
}

export default new ContentService();
