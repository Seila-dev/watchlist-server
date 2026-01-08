import { prisma } from '../database/client.js';

class AnnotationRepository {
  async findByContentId(contentId, userId, options = {}) {
    const { skip = 0, take = 50, orderBy = { isPinned: 'desc', createdAt: 'desc' } } = options;

    return await prisma.annotation.findMany({
      where: {
        contentId,
        deletedAt: null,
        OR: [
          { userId }, 
          { isPublic: true },
        ],
      },
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });
  }

  async findUserHistory(userId, { skip = 0, take = 15 } = {}) {
    return await prisma.annotation.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            category: true,
            visibility: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return await prisma.annotation.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findDetailsById(id, userId) {
    return await prisma.annotation.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { userId }, 
          { isPublic: true }, 
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            category: true,
            ownerId: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });
  }

  async create(data) {
    return await prisma.annotation.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async updateById(id, data) {
    return await prisma.annotation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async softDeleteById(id, deletedAt = new Date()) {
    return await prisma.annotation.update({
      where: { id },
      data: { deletedAt },
      select: { id: true },
    });
  }

  async unpinAllUserAnnotations(contentId, userId) {
    return await prisma.annotation.updateMany({
      where: {
        contentId,
        userId,
        isPinned: true,
        deletedAt: null,
      },
      data: { isPinned: false },
    });
  }

  async countPinnedByUser(contentId, userId) {
    return await prisma.annotation.count({
      where: {
        contentId,
        userId,
        isPinned: true,
        deletedAt: null,
      },
    });
  }

  async createShareToken(data) {
    return await prisma.shareToken.create({ data });
  }

  async updateShareToken(annotationId, shareTokenId) {
    return await prisma.annotation.update({
      where: { id: annotationId },
      data: { shareTokenId },
      select: { id: true, shareTokenId: true },
    });
  }

  async createReaction(data) {
    return await prisma.reaction.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteReaction(userId, annotationId, emoji) {
    return await prisma.reaction.deleteMany({
      where: {
        userId,
        annotationId,
        emoji,
        entityType: 'ANNOTATION',
      },
    });
  }

  async findReaction(userId, annotationId, emoji) {
    return await prisma.reaction.findFirst({
      where: {
        userId,
        annotationId,
        emoji,
        entityType: 'ANNOTATION',
      },
    });
  }

  async findReactionsByAnnotationId(annotationId) {
    return await prisma.reaction.findMany({
      where: {
        annotationId,
        entityType: 'ANNOTATION',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new AnnotationRepository();