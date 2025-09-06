// import Joi from 'joi';

// // Schema para criação de conteúdo
// export const createContentSchema = Joi.object({
//   title: Joi.string()
//     .min(1)
//     .max(255)
//     .required()
//     .messages({
//       'string.empty': 'Title is required',
//       'string.max': 'Title must be less than 255 characters'
//     }),

//   description: Joi.string()
//     .max(2000)
//     .allow('')
//     .optional()
//     .messages({
//       'string.max': 'Description must be less than 2000 characters'
//     }),

//   category: Joi.string()
//     .valid('MOVIES', 'SERIES', 'ANIMES', 'BOOKS', 'MANGAS')
//     .required()
//     .messages({
//       'any.only': 'Category must be one of: MOVIES, SERIES, ANIMES, BOOKS, MANGAS'
//     }),

//   coverUrl: Joi.string()
//     .uri()
//     .allow('')
//     .optional()
//     .messages({
//       'string.uri': 'Cover URL must be a valid URL'
//     }),

//   visibility: Joi.string()
//     .valid('PUBLIC', 'UNLISTED', 'PRIVATE')
//     .default('PRIVATE')
//     .messages({
//       'any.only': 'Visibility must be one of: PUBLIC, UNLISTED, PRIVATE'
//     }),

//   status: Joi.string()
//     .valid('TO_WATCH', 'WATCHING', 'FINISHED')
//     .default('TO_WATCH')
//     .messages({
//       'any.only': 'Status must be one of: TO_WATCH, WATCHING, FINISHED'
//     }),

//   rating: Joi.number()
//     .min(0)
//     .max(10)
//     .precision(1)
//     .allow(null)
//     .optional()
//     .messages({
//       'number.min': 'Rating must be at least 0',
//       'number.max': 'Rating must be at most 10',
//       'number.precision': 'Rating must have at most 1 decimal place'
//     }),

//   startedAt: Joi.date()
//     .iso()
//     .allow(null)
//     .optional()
//     .messages({
//       'date.format': 'Started date must be in ISO format'
//     }),

//   finishedAt: Joi.date()
//     .iso()
//     .min(Joi.ref('startedAt'))
//     .allow(null)
//     .optional()
//     .messages({
//       'date.format': 'Finished date must be in ISO format',
//       'date.min': 'Finished date must be after started date'
//     })
// });

// // Schema para atualização de conteúdo
// export const updateContentSchema = Joi.object({
//   title: Joi.string()
//     .min(1)
//     .max(255)
//     .optional()
//     .messages({
//       'string.empty': 'Title cannot be empty',
//       'string.max': 'Title must be less than 255 characters'
//     }),

//   description: Joi.string()
//     .max(2000)
//     .allow('')
//     .optional()
//     .messages({
//       'string.max': 'Description must be less than 2000 characters'
//     }),

//   coverUrl: Joi.string()
//     .uri()
//     .allow('')
//     .optional()
//     .messages({
//       'string.uri': 'Cover URL must be a valid URL'
//     }),

//   visibility: Joi.string()
//     .valid('PUBLIC', 'UNLISTED', 'PRIVATE')
//     .optional()
//     .messages({
//       'any.only': 'Visibility must be one of: PUBLIC, UNLISTED, PRIVATE'
//     }),

//   status: Joi.string()
//     .valid('TO_WATCH', 'WATCHING', 'FINISHED')
//     .optional()
//     .messages({
//       'any.only': 'Status must be one of: TO_WATCH, WATCHING, FINISHED'
//     }),

//   rating: Joi.number()
//     .min(0)
//     .max(10)
//     .precision(1)
//     .allow(null)
//     .optional()
//     .messages({
//       'number.min': 'Rating must be at least 0',
//       'number.max': 'Rating must be at most 10',
//       'number.precision': 'Rating must have at most 1 decimal place'
//     }),

//   isFavorite: Joi.boolean()
//     .optional(),

//   startedAt: Joi.date()
//     .iso()
//     .allow(null)
//     .optional()
//     .messages({
//       'date.format': 'Started date must be in ISO format'
//     }),

//   finishedAt: Joi.date()
//     .iso()
//     .min(Joi.ref('startedAt'))
//     .allow(null)
//     .optional()
//     .messages({
//       'date.format': 'Finished date must be in ISO format',
//       'date.min': 'Finished date must be after started date'
//     })
// }).min(1).messages({
//   'object.min': 'At least one field is required for update'
// });

// // Schema para query parameters
// export const contentQuerySchema = Joi.object({
//   page: Joi.number()
//     .integer()
//     .min(1)
//     .default(1)
//     .messages({
//       'number.min': 'Page must be at least 1'
//     }),

//   limit: Joi.number()
//     .integer()
//     .min(1)
//     .max(100)
//     .default(20)
//     .messages({
//       'number.min': 'Limit must be at least 1',
//       'number.max': 'Limit must be at most 100'
//     }),

//   category: Joi.string()
//     .valid('MOVIES', 'SERIES', 'ANIMES', 'BOOKS', 'MANGAS')
//     .optional()
//     .messages({
//       'any.only': 'Category must be one of: MOVIES, SERIES, ANIMES, BOOKS, MANGAS'
//     }),

//   status: Joi.string()
//     .valid('TO_WATCH', 'WATCHING', 'FINISHED')
//     .optional()
//     .messages({
//       'any.only': 'Status must be one of: TO_WATCH, WATCHING, FINISHED'
//     }),

//   search: Joi.string()
//     .max(255)
//     .optional()
//     .messages({
//       'string.max': 'Search term must be less than 255 characters'
//     }),

//   sortBy: Joi.string()
//     .valid('createdAt', 'updatedAt', 'title', 'rating', 'startedAt', 'finishedAt')
//     .default('createdAt')
//     .messages({
//       'any.only': 'SortBy must be one of: createdAt, updatedAt, title, rating, startedAt, finishedAt'
//     }),

//   sortOrder: Joi.string()
//     .valid('asc', 'desc')
//     .default('desc')
//     .messages({
//       'any.only': 'SortOrder must be either asc or desc'
//     })
// });

// // Schema para comentários
// export const createCommentSchema = Joi.object({
//   text: Joi.string()
//     .min(1)
//     .max(1000)
//     .required()
//     .messages({
//       'string.empty': 'Comment text is required',
//       'string.max': 'Comment must be less than 1000 characters'
//     }),

//   contentId: Joi.string()
//     .uuid()
//     .messages({
//       'string.uuid': 'Content ID must be a valid UUID'
//     }),

//   albumId: Joi.string()
//     .uuid()
//     .messages({
//       'string.uuid': 'Album ID must be a valid UUID'
//     }),

//   parentCommentId: Joi.string()
//     .uuid()
//     .optional()
//     .messages({
//       'string.uuid': 'Parent comment ID must be a valid UUID'
//     })
// })

//   .xor('contentId', 'albumId')
//   .messages({
//     'object.missing': 'Either contentId or albumId is required',
//     'object.xor': 'Provide either contentId or albumId, not both'
//   });

// // Schema para anotações
// export const createAnnotationSchema = Joi.object({
//   text: Joi.string()
//     .min(1)
//     .max(2000)
//     .required()
//     .messages({
//       'string.empty': 'Annotation text is required',
//       'string.max': 'Annotation must be less than 2000 characters'
//     }),

//   contentId: Joi.string()
//     .uuid()
//     .required()
//     .messages({
//       'string.uuid': 'Content ID must be a valid UUID',
//       'any.required': 'Content ID is required'
//     }),

//   isPublic: Joi.boolean()
//     .default(false),

//   isPinned: Joi.boolean()
//     .default(false)
// });

// // Schema para reações
// export const createReactionSchema = Joi.object({
//   emoji: Joi.string()
//     .valid('LIKE', 'LOVE', 'FIRE', 'SAD', 'WOW', 'LAUGH')
//     .required()
//     .messages({
//       'any.only': 'Emoji must be one of: LIKE, LOVE, FIRE, SAD, WOW, LAUGH',
//       'any.required': 'Emoji is required'
//     }),

//   entityType: Joi.string()
//     .valid('CONTENT', 'COMMENT', 'ANNOTATION', 'ALBUM')
//     .required()
//     .messages({
//       'any.only': 'Entity type must be one of: CONTENT, COMMENT, ANNOTATION, ALBUM',
//       'any.required': 'Entity type is required'
//     }),

//   entityId: Joi.string()
//     .uuid()
//     .required()
//     .messages({
//       'string.uuid': 'Entity ID must be a valid UUID',
//       'any.required': 'Entity ID is required'
//     })
// });