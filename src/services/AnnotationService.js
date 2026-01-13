import AnnotationRepository from '../repositories/AnnotationRepository.js';
import ContentRepository from '../repositories/ContentRepository.js';

class AnnotationService {
  async createAnnotation(userId, contentId, data) {
    const { title, text, isPublic = false, isPinned = false } = data;

    if (!text || text.trim().length === 0) {
      const error = new Error('O texto da anotação é obrigatório');
      error.code = 400;
      throw error;
    }

    if (text.length > 5000) { 
      const error = new Error('A anotação excede o limite de 5.000 letras');
      error.code = 400;
      throw error;
    }

    const content = await ContentRepository.findById(contentId);
    if (!content || content.deletedAt) {
      const error = new Error('Conteúdo não encontrado');
      error.code = 404;
      throw error;
    }


    const hasAccess = await ContentRepository.findDetailsAuthorized(userId, contentId);
    if (!hasAccess) {
      const error = new Error('Você não tem permissão para criar anotações neste conteúdo');
      error.code = 403;
      throw error;
    }

    if (isPinned) {
      await AnnotationRepository.unpinAllUserAnnotations(contentId, userId);
    }

    const annotation = await AnnotationRepository.create({
      userId,
      contentId,
      title: title?.trim() || null,
      text: text.trim(),
      isPublic: Boolean(isPublic),
      isPinned: Boolean(isPinned),
    });

    return annotation;
  }

  async getAnnotationsByContent(userId, contentId, options = {}) {
    const hasAccess = await ContentRepository.findDetailsAuthorized(userId, contentId);
    if (!hasAccess) {
      const error = new Error('Você não tem permissão para ver as anotações deste conteúdo');
      error.code = 403;
      throw error;
    }

    const annotations = await AnnotationRepository.findByContentId(
      contentId,
      userId,
      options
    );

    return annotations;
  }

  async getUserAnnotationHistory(userId, options = {}) {
    const annotations = await AnnotationRepository.findUserHistory(userId, options);
    return annotations;
  }

  async getAnnotationById(userId, annotationId) {
    const annotation = await AnnotationRepository.findDetailsById(annotationId, userId);

    if (!annotation) {
      const error = new Error('Anotação não encontrada ou você não tem permissão para visualizá-la');
      error.code = 404;
      throw error;
    }

    return annotation;
  }

  // Atualizar anotação
  async updateAnnotation(userId, annotationId, data) {
    const existing = await AnnotationRepository.findById(annotationId);

    if (!existing) {
      const error = new Error('Anotação não encontrada');
      error.code = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error = new Error('Você não tem permissão para editar esta anotação');
      error.code = 403;
      throw error;
    }

    const updatable = {};

    if ('title' in data) {
      updatable.title = data.title?.trim() || null;
    }

    if ('text' in data) {
      if (!data.text || data.text.trim().length === 0) {
        const error = new Error('O texto da anotação não pode estar vazio');
        error.code = 400;
        throw error;
      }

      if (data.text.length > 5000) {
        const error = new Error('A anotação excede o limite de 5.000 letras');
        error.code = 400;
        throw error;
      }

      updatable.text = data.text.trim();
    }

    if ('isPublic' in data) {
      updatable.isPublic = Boolean(data.isPublic);
    }

    const updated = await AnnotationRepository.updateById(annotationId, updatable);
    return updated;
  }

  // Fixar/desfixar anotação (apenas 1 fixada por vez)
  async togglePinAnnotation(userId, annotationId) {
    const existing = await AnnotationRepository.findById(annotationId);

    if (!existing) {
      const error = new Error('Anotação não encontrada');
      error.code = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error = new Error('Você não tem permissão para fixar esta anotação');
      error.code = 403;
      throw error;
    }

    // Se está fixando, desafixar outras
    if (!existing.isPinned) {
      await AnnotationRepository.unpinAllUserAnnotations(existing.contentId, userId);
    }

    const updated = await AnnotationRepository.updateById(annotationId, {
      isPinned: !existing.isPinned,
    });

    return updated;
  }

  // Deletar anotação (soft delete)
  async deleteAnnotation(userId, annotationId) {
    const existing = await AnnotationRepository.findById(annotationId);

    if (!existing) {
      const error = new Error('Anotação não encontrada');
      error.code = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error = new Error('Você não tem permissão para deletar esta anotação');
      error.code = 403;
      throw error;
    }

    await AnnotationRepository.softDeleteById(annotationId);
    return { id: annotationId };
  }

  // Criar link de compartilhamento
  async createShareLink(userId, annotationId, { expiresInHours } = {}) {
    const annotation = await AnnotationRepository.findById(annotationId);

    if (!annotation) {
      const error = new Error('Anotação não encontrada');
      error.code = 404;
      throw error;
    }

    if (annotation.userId !== userId) {
      const error = new Error('Você não tem permissão para compartilhar esta anotação');
      error.code = 403;
      throw error;
    }

    if (!annotation.isPublic) {
      const error = new Error('Apenas anotações públicas podem ser compartilhadas');
      error.code = 400;
      throw error;
    }

    const tokenValue = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt =
      typeof expiresInHours === 'number' && expiresInHours > 0
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
        : null;

    const shareToken = await AnnotationRepository.createShareToken({
      token: tokenValue,
      entityType: 'ANNOTATION',
      entityId: annotationId,
      createdById: userId,
      expiresAt,
    });

    await AnnotationRepository.updateShareToken(annotationId, shareToken.id);

    const base = (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/?$/, '');
    return {
      token: shareToken.token,
      shareTokenId: shareToken.id,
      expiresAt: shareToken.expiresAt,
      url: `${base}/share/annotation/${shareToken.token}`,
    };
  }

  // Copiar anotação (criar nova baseada em outra)
  async copyAnnotation(userId, annotationId) {
    const original = await AnnotationRepository.findDetailsById(annotationId, userId);

    if (!original) {
      const error = new Error('Anotação não encontrada ou você não tem permissão para copiá-la');
      error.code = 404;
      throw error;
    }

    if (!original.isPublic && original.userId !== userId) {
      const error = new Error('Você não tem permissão para copiar esta anotação');
      error.code = 403;
      throw error;
    }

    // Verificar se o usuário tem acesso ao conteúdo original
    const hasAccess = await ContentRepository.findDetailsAuthorized(
      userId,
      original.contentId
    );
    if (!hasAccess) {
      const error = new Error('Você não tem acesso ao conteúdo desta anotação');
      error.code = 403;
      throw error;
    }

    // Criar nova anotação copiada
    const copied = await AnnotationRepository.create({
      userId,
      contentId: original.contentId,
      title: original.title ? `${original.title} (cópia)` : null,
      text: original.text,
      isPublic: false, // Sempre privada ao copiar
      isPinned: false, // Não fixar ao copiar
    });

    return copied;
  }

  // Adicionar reação
  async addReaction(userId, annotationId, emoji) {
    const validEmojis = ['LIKE', 'LOVE', 'FIRE', 'SAD', 'WOW', 'LAUGH'];

    if (!validEmojis.includes(emoji)) {
      const error = new Error('Emoji inválido');
      error.code = 400;
      throw error;
    }

    // Verificar se a anotação existe e se o usuário tem acesso
    const annotation = await AnnotationRepository.findDetailsById(annotationId, userId);

    if (!annotation) {
      const error = new Error('Anotação não encontrada ou você não tem permissão para reagir');
      error.code = 404;
      throw error;
    }

    // Verificar se já reagiu com esse emoji
    const existingReaction = await AnnotationRepository.findReaction(
      userId,
      annotationId,
      emoji
    );

    if (existingReaction) {
      const error = new Error('Você já reagiu com este emoji');
      error.code = 400;
      throw error;
    }

    const reaction = await AnnotationRepository.createReaction({
      userId,
      entityType: 'ANNOTATION',
      entityId: annotationId,
      annotationId,
      emoji,
    });

    return reaction;
  }

  // Remover reação
  async removeReaction(userId, annotationId, emoji) {
    const validEmojis = ['LIKE', 'LOVE', 'FIRE', 'SAD', 'WOW', 'LAUGH'];

    if (!validEmojis.includes(emoji)) {
      const error = new Error('Emoji inválido');
      error.code = 400;
      throw error;
    }

    // Verificar se a anotação existe
    const annotation = await AnnotationRepository.findById(annotationId);

    if (!annotation) {
      const error = new Error('Anotação não encontrada');
      error.code = 404;
      throw error;
    }

    await AnnotationRepository.deleteReaction(userId, annotationId, emoji);

    return { success: true };
  }

  // Listar reações de uma anotação
  async getAnnotationReactions(userId, annotationId) {
    // Verificar se o usuário tem acesso à anotação
    const annotation = await AnnotationRepository.findDetailsById(annotationId, userId);

    if (!annotation) {
      const error = new Error('Anotação não encontrada ou você não tem permissão');
      error.code = 404;
      throw error;
    }

    const reactions = await AnnotationRepository.findReactionsByAnnotationId(annotationId);

    // Agrupar por emoji
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {});

    return Object.values(grouped);
  }
}

export default new AnnotationService();