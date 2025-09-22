import { prisma } from '../database/client.js';

class ContentRepository {
  async findAllWithPagination(where, skip, take, orderBy) {
    return await prisma.content.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        owner: { select: { id: true, username: true } },
      },
    });
  }

  async findManyByIds(ids, where = {}, orderBy) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    return await prisma.content.findMany({
      where: { ...where, id: { in: ids } },
      orderBy,
      include: {
        owner: { select: { id: true, username: true } },
      },
    });
  }

  async count(where) {
    return await prisma.content.count({ where });
  }

  async findById(id) {
    return await prisma.content.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, visibility: true, shareTokenId: true },
    });
  }

  async findDetailsAuthorized(userId, id) {
    return await prisma.content.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { ownerId: userId },
          { visibility: 'PUBLIC' },
        ],
      },
      include: {
        owner: { select: { id: true, username: true, commentsEnabled: true } },
        annotations: {
          where: { isPublic: true, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, username: true } } },
        },
        albumLinks: {
          include: {
            album: { select: { id: true, title: true, coverUrl: true, visibility: true } },
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.content.create({
      data,
      include: {
        owner: { select: { id: true, username: true } },
      },
    });
  }

  async createShareToken(data) {
    return await prisma.shareToken.create({ data });
  }

  async updateContentShareToken(contentId, shareTokenId) {
    return await prisma.content.update({
      where: { id: contentId },
      data: { shareTokenId },
      select: { id: true, shareTokenId: true },
    });
  }

  async findByIdForOwnerChecks(id) {
    return await prisma.content.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, coverUrl: true, visibility: true },
    });
  }

  async updateById(id, data) {
    return await prisma.content.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, username: true } },
      },
    });
  }

  async softDeleteById(id, deletedAt = new Date()) {
    return await prisma.content.update({
      where: { id },
      data: { deletedAt },
      select: { id: true },
    });
  }
}

export default new ContentRepository();
