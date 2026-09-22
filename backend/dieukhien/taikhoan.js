// Xu ly tai khoan nguoi dung.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../cauhinh/database');
const { requireFields } = require('../tienich/validation');

const publicUser = (user) => ({ id: user.id, full_name: user.full_name, email: user.email, username: user.username, phone: user.phone, avatar_url: user.avatar_url, role: user.role || 'user', status: user.status || 'active', created_at: user.created_at });

async function register(req, res, next) {
  const connection = await pool.getConnection();
  try {
    requireFields(req.body, ['full_name', 'email', 'username', 'password']);
    if (String(req.body.password).length < 6) { const error = new Error('Mật khẩu phải có ít nhất 6 ký tự.'); error.status = 400; throw error; }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [req.body.email.trim().toLowerCase(), req.body.username.trim()]);
    if (existing.length) { const error = new Error('Email hoặc tên đăng nhập đã được sử dụng.'); error.status = 409; throw error; }
    const password = await bcrypt.hash(req.body.password, 12);
    await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO users (full_name, email, username, password, phone) VALUES (?, ?, ?, ?, ?)', [req.body.full_name.trim(), req.body.email.trim().toLowerCase(), req.body.username.trim(), password, req.body.phone?.trim() || null]);
    const fallbackDefaults = [
      ['Ăn uống', 'expense', '🍜'], ['Di chuyển', 'expense', '🛵'], ['Mua sắm', 'expense', '🛍️'],
      ['Giải trí', 'expense', '🎬'], ['Học tập', 'expense', '📚'], ['Sức khỏe', 'expense', '💊'],
      ['Nhà ở', 'expense', '🏠'], ['Hóa đơn', 'expense', '🧾'], ['Khác', 'expense', '📌'],
      ['Lương', 'income', '💼'], ['Làm thêm', 'income', '💻'], ['Thưởng', 'income', '🎁'],
      ['Kinh doanh', 'income', '📈'], ['Gia đình hỗ trợ', 'income', '🤝'], ['Khác', 'income', '📌'],
    ];
    const [systemCategories] = await connection.query('SELECT name, type, icon FROM system_categories ORDER BY type, name');
    const defaults = systemCategories.length ? systemCategories.map((item) => [item.name, item.type, item.icon]) : fallbackDefaults;
    await connection.query('INSERT INTO categories (user_id, name, type, icon) VALUES ?', [defaults.map((item) => [result.insertId, ...item])]);
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    await connection.commit();
    const user = publicUser(rows[0]);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (error) { await connection.rollback(); next(error); }
  finally { connection.release(); }
}

async function login(req, res, next) {
  try {
    requireFields(req.body, ['login', 'password']);
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1', [req.body.login.trim().toLowerCase(), req.body.login.trim()]);
    const userRow = rows[0];
    if (!userRow || userRow.status === 'locked' || !(await bcrypt.compare(req.body.password, userRow.password))) { const error = new Error('Thông tin đăng nhập không chính xác hoặc tài khoản đã bị khóa.'); error.status = 401; throw error; }
    const user = publicUser(userRow);
    const token = jwt.sign({ id: user.id, username: user.username, role: userRow.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) { next(error); }
}

async function profile(req, res, next) {
  try { const [rows] = await pool.query('SELECT id, full_name, email, username, phone, avatar_url, role, status, created_at FROM users WHERE id = ?', [req.user.id]); res.json(rows[0]); } catch (error) { next(error); }
}

async function updateProfile(req, res, next) {
  try {
    requireFields(req.body, ['full_name', 'email', 'username']);
    if (req.body.avatar_url && (!String(req.body.avatar_url).startsWith('data:image/') || String(req.body.avatar_url).length > 4000000)) { const error = new Error('Ảnh đại diện không hợp lệ hoặc quá lớn.'); error.status = 400; throw error; }
    await pool.query('UPDATE users SET full_name=?, email=?, username=?, phone=?, avatar_url=? WHERE id=?', [req.body.full_name.trim(), req.body.email.trim().toLowerCase(), req.body.username.trim(), req.body.phone?.trim() || null, req.body.avatar_url || null, req.user.id]);
    return profile(req, res, next);
  } catch (error) { next(error); }
}

async function changePassword(req, res, next) {
  try {
    requireFields(req.body, ['current_password', 'new_password']);
    if (String(req.body.new_password).length < 6) { const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự.'); error.status = 400; throw error; }
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0] || !(await bcrypt.compare(req.body.current_password, rows[0].password))) { const error = new Error('Mật khẩu hiện tại không đúng.'); error.status = 400; throw error; }
    await pool.query('UPDATE users SET password=? WHERE id=?', [await bcrypt.hash(req.body.new_password, 12), req.user.id]);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) { next(error); }
}

module.exports = { register, login, profile, updateProfile, changePassword };
