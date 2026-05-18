import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}\n${err.stack}`);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Data sudah ada (unique constraint violation)', field: err.meta?.target });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Data tidak ditemukan' });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validasi gagal', details: err.errors });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
};
