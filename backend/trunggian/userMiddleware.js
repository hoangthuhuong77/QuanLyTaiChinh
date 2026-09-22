function requireUser(req, _res, next) {
  if (req.user.role === 'admin') {
    const error = new Error('Quản trị viên không sử dụng chức năng tài chính cá nhân.');
    error.status = 403;
    return next(error);
  }
  return next();
}

module.exports = requireUser;
