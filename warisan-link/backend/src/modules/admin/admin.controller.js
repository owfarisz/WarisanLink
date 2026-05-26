import * as adminService from './admin.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const result = await adminService.getUsers({ status, role, page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['ACTIVE', 'REJECTED', 'SUSPENDED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid' });
    }
    const user = await adminService.updateUserStatus(req.params.id, status, req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    if (err.code === 'SELF_UPDATE') {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const moderateDestination = async (req, res, next) => {
  try {
    const { destStatus } = req.body;
    const allowed = ['PUBLISHED', 'REJECTED'];
    if (!allowed.includes(destStatus)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid' });
    }
    const dest = await adminService.moderateDestination(parseInt(req.params.id), destStatus);
    res.json({ success: true, data: dest });
  } catch (err) {
    next(err);
  }
};
