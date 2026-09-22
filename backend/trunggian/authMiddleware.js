const jwt = require('jsonwebtoken');
const pool = require('../cauhinh/database');

function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Vui lòng đăng nhập để tiếp tục.');
    error.status = 401;
    return next(error);
  }
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {
    const error = new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    error.status = 401;
    return next(error);
  }
  return pool.query('SELECT role, status FROM users WHERE id = ? LIMIT 1', [req.user.id])
    .then(([rows]) => {
      if (!rows[0] || rows[0].status !== 'active') {
        const error = new Error('Tài khoản không tồn tại hoặc đã bị khóa.');
        error.status = 401;
        return next(error);
      }
      req.user.role = rows[0].role;
      return next();
    })
    .catch(next);
}

module.exports = requireAuth;
