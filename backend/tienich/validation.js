function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length) {
    const error = new Error(`Thiếu dữ liệu bắt buộc: ${missing.join(', ')}.`);
    error.status = 400;
    throw error;
  }
}

function positiveMoney(value, field = 'amount') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error(`${field} phải là số lớn hơn 0.`);
    error.status = 400;
    throw error;
  }
  return amount;
}

function assertType(type) {
  if (!['income', 'expense'].includes(type)) {
    const error = new Error('Loại phải là income hoặc expense.');
    error.status = 400;
    throw error;
  }
}

module.exports = { requireFields, positiveMoney, assertType };
