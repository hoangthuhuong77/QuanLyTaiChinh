const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../cauhinh/database');

async function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Vui lòng đăng nhập để tiếp tục.');
    error.status = 401;
    return next(error);
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const error = new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    error.status = 401;
    return next(error);
  }

  try {
    const [rows] = await pool.query('SELECT role, status FROM users WHERE id=? LIMIT 1', [req.user.id]);
    if (!rows[0] || rows[0].status !== 'active') {
      const error = new Error('Tài khoản không tồn tại hoặc đã bị khóa.');
      error.status = 401;
      return next(error);
    }
    req.user.role = rows[0].role;

    if (rows[0].role === 'admin') {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const [sessions] = await pool.query(
        'SELECT id FROM admin_sessions WHERE user_id=? AND token_hash=? AND revoked_at IS NULL AND expires_at>NOW() LIMIT 1',
        [req.user.id, tokenHash],
      );
      if (!sessions[0]) {
        const error = new Error('Phiên quản trị đã hết hạn hoặc đã bị đăng xuất.');
        error.status = 401;
        return next(error);
      }
      req.sessionId = sessions[0].id;
      req.authTokenHash = tokenHash;
      await pool.query('UPDATE admin_sessions SET last_used_at=NOW() WHERE id=?', [req.sessionId]);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = requireAuth;
