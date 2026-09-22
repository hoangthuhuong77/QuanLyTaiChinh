const pool = require('../cauhinh/database');

async function requireAdmin(req, _res, next) {
  try {
    const [rows] = await pool.query('SELECT role, status FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows[0] || rows[0].status !== 'active') {
      const error = new Error('Tài khoản không có quyền truy cập.');
      error.status = 403;
      return next(error);
    }
    if (rows[0].role !== 'admin') {
      const error = new Error('Chỉ quản trị viên mới được phép thực hiện thao tác này.');
      error.status = 403;
      return next(error);
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = requireAdmin;