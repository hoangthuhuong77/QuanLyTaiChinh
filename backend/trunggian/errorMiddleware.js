function notFound(req, _res, next) {
  const error = new Error(`Không tìm thấy API ${req.method} ${req.originalUrl}.`);
  error.status = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.code === 'ER_DUP_ENTRY' ? 409 : 500);
  if (status >= 500) console.error(error);
  const message = error.code === 'ER_DUP_ENTRY'
    ? 'Dữ liệu đã tồn tại, vui lòng chọn giá trị khác.'
    : (status >= 500 ? 'Máy chủ gặp lỗi, vui lòng thử lại.' : error.message);
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
