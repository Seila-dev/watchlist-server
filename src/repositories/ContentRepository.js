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

  async count(where) {
    return await prisma.content.count({ where });
  }
}

export default new ContentRepository();
