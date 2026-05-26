import * as authService from './auth.service.js';
import { validate } from '../../middlewares/validate.js';
import { RegisterSchema, LoginSchema } from './auth.schema.js';

export const register = [
  validate(RegisterSchema),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      if (err.code === 'EMAIL_EXISTS') {
        return res.status(409).json({ success: false, error: err.message });
      }
      next(err);
    }
  },
];

export const login = [
  validate(LoginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      const authCodes = ['INVALID_CREDENTIALS', 'ACCOUNT_PENDING', 'ACCOUNT_REJECTED', 'ACCOUNT_SUSPENDED'];
      if (authCodes.includes(err.code)) {
        return res.status(401).json({ success: false, error: err.message, code: err.code });
      }
      next(err);
    }
  },
];

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
