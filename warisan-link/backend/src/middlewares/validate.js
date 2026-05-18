export const validate = (schema) => (req, res, next) => {
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = schema.parse(req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = schema.parse(req.query);
    }
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = schema.parse(req.params);
    }
    next();
  } catch (error) {
    next(error);
  }
};
