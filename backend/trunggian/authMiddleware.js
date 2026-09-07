const jwt = require('jsonwebtoken');

function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Vui lòng đăng nhập để tiếp tục.');
    error.status = 401;
    return next(error);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    const error = new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    error.status = 401;
    return next(error);
  }
}

module.exports = requireAuth;
