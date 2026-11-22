const Joi = require('joi');

function groupHeaderMiddleware(group = 'BBMO-01-23') {
  return async (ctx, next) => {
    ctx.set('X-Group', group);
    await next();
  };
}

function dbMiddleware(db) {
  return async (ctx, next) => {
    ctx.db = db;
    await next();
  };
}

function loggerMiddleware() {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${time}] [ББМО-01-23] ${ctx.method} ${ctx.url} -> ${ctx.status} (${ms}ms)`);
  };
}

function errorMiddleware() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (err.isJoi) {
        ctx.status = 400;
        ctx.body = {
          error: 'Validation failed',
          status: 400,
          details: err.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message
          }))
        };
        return;
      }

      if (err.code === 11000 || err.status === 409) {
        ctx.status = 409;
        ctx.body = {
          error: err.message || 'Email already exists',
          status: 409
        };
        return;
      }

      if (err.status === 400 || err.name === 'BSONError') {
        ctx.status = 400;
        ctx.body = {
          error: err.status === 400 ? err.message : 'Invalid ID format',
          status: 400
        };
        return;
      }

      if (err.status === 404) {
        ctx.status = 404;
        ctx.body = {
          error: err.message || 'User not found',
          status: 404
        };
        return;
      }

      console.error('[ERROR]', err);
      ctx.status = 500;
      ctx.body = {
        error: 'Internal server error',
        status: 500
      };
    }
  };
}

function validate(schema, source = 'body') {
  return async (ctx, next) => {
    const data = source === 'query' ? ctx.query : ctx.request.body;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: source === 'body'
    });
    if (error) {
      error.isJoi = true;
      throw error;
    }
    if (source === 'query') {
      ctx.validatedQuery = value;
    } else {
      ctx.validatedBody = value;
    }
    await next();
  };
}

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  group_name: Joi.string().trim().pattern(/^ББМО-\d{2}-\d{2}$/).required(),
  age: Joi.number().integer().min(16).max(100).required(),
  course: Joi.number().integer().min(1).max(4).optional().default(1)
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  group_name: Joi.string().trim().pattern(/^ББМО-\d{2}-\d{2}$/).optional(),
  age: Joi.number().integer().min(16).max(100).optional(),
  course: Joi.number().integer().min(1).max(4).optional()
}).min(1);

const queryUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  group_name: Joi.string().trim().pattern(/^ББМО-\d{2}-\d{2}$/).optional(),
  course: Joi.number().integer().min(1).max(4).optional(),
  age_min: Joi.number().integer().min(16).max(100).optional(),
  age_max: Joi.number().integer().min(16).max(100).optional(),
  sort: Joi.string().valid('name', '-name', 'age', '-age', 'created_at', '-created_at').default('-created_at'),
  search: Joi.string().trim().min(1).optional()
});

module.exports = {
  groupHeaderMiddleware,
  dbMiddleware,
  loggerMiddleware,
  errorMiddleware,
  validate,
  createUserSchema,
  updateUserSchema,
  queryUsersSchema
};