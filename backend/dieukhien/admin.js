const pool = require('../cauhinh/database');
const { requireFields, assertType } = require('../tienich/validation');

const userFields = 'id, full_name, email, username, phone, avatar_url, role, status, created_at, updated_at';

async function dashboard(_req, res, next) {
  try {
    const [[metrics]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) new_users,
        (SELECT COUNT(*) FROM users WHERE status = 'active') active_users,
        (SELECT COUNT(*) FROM transactions) total_transactions,
        (SELECT COUNT(*) FROM wallets) total_wallets,
        (SELECT COUNT(*) FROM categories) total_categories
    `);
    res.json(Object.fromEntries(Object.entries(metrics).map(([key, value]) => [key, Number(value)])));
  } catch (error) { next(error); }
}

async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    if (req.query.search) {
      where = 'WHERE full_name LIKE ? OR email LIKE ? OR username LIKE ?';
      const search = `%${String(req.query.search).trim()}%`;
      params.push(search, search, search);
    }
    if (['active', 'locked'].includes(req.query.status)) { where += where ? ' AND status=?' : 'WHERE status=?'; params.push(req.query.status); }
    const [[count]] = await pool.query(`SELECT COUNT(*) total FROM users ${where}`, params);
    const [rows] = await pool.query(`SELECT ${userFields} FROM users ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    res.json({ items: rows, page, limit, total: Number(count.total), total_pages: Math.ceil(Number(count.total) / limit) });
  } catch (error) { next(error); }
}

async function detailUser(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT ${userFields} FROM users WHERE id=?`, [req.params.id]);
    if (!rows[0]) { const error = new Error('Không tìm thấy người dùng.'); error.status = 404; throw error; }
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function setUserStatus(req, res, next) {
  try {
    if (!['active', 'locked'].includes(req.body.status)) { const error = new Error('Trạng thái phải là active hoặc locked.'); error.status = 400; throw error; }
    if (String(req.params.id) === String(req.user.id)) { const error = new Error('Không thể khóa tài khoản quản trị viên đang đăng nhập.'); error.status = 400; throw error; }
    const [result] = await pool.query('UPDATE users SET status=? WHERE id=? AND role <> \'admin\'', [req.body.status, req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy người dùng hoặc không thể thay đổi tài khoản quản trị viên.'); error.status = 404; throw error; }
    return detailUser(req, res, next);
  } catch (error) { next(error); }
}

async function removeUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user.id)) { const error = new Error('Không thể xóa tài khoản đang đăng nhập.'); error.status = 400; throw error; }
    const [result] = await pool.query('DELETE FROM users WHERE id=? AND role <> \'admin\'', [req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy người dùng hoặc không thể xóa tài khoản quản trị viên.'); error.status = 404; throw error; }
    res.status(204).end();
  } catch (error) { next(error); }
}

async function listCategories(_req, res, next) {
  try { const [rows] = await pool.query('SELECT * FROM system_categories ORDER BY type, name'); res.json(rows); } catch (error) { next(error); }
}

async function createCategory(req, res, next) {
  try { requireFields(req.body, ['name', 'type']); assertType(req.body.type); const [result] = await pool.query('INSERT INTO system_categories (name,type,icon) VALUES (?,?,?)', [req.body.name.trim(), req.body.type, req.body.icon || null]); const [rows] = await pool.query('SELECT * FROM system_categories WHERE id=?', [result.insertId]); res.status(201).json(rows[0]); } catch (error) { next(error); }
}

async function updateCategory(req, res, next) {
  try { requireFields(req.body, ['name', 'type']); assertType(req.body.type); const [result] = await pool.query('UPDATE system_categories SET name=?,type=?,icon=? WHERE id=?', [req.body.name.trim(), req.body.type, req.body.icon || null, req.params.id]); if (!result.affectedRows) { const error = new Error('Không tìm thấy danh mục hệ thống.'); error.status = 404; throw error; } const [rows] = await pool.query('SELECT * FROM system_categories WHERE id=?', [req.params.id]); res.json(rows[0]); } catch (error) { next(error); }
}

async function removeCategory(req, res, next) {
  try { const [result] = await pool.query('DELETE FROM system_categories WHERE id=?', [req.params.id]); if (!result.affectedRows) { const error = new Error('Không tìm thấy danh mục hệ thống.'); error.status = 404; throw error; } res.status(204).end(); } catch (error) { next(error); }
}

async function statistics(req, res, next) {
  try {
    const [[totals]] = await pool.query(`SELECT (SELECT COUNT(*) FROM users) total_users, (SELECT COUNT(*) FROM transactions) total_transactions, (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)) new_users_30_days`);
    const [monthlyUsers] = await pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m') month, COUNT(*) users FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`);
    const [monthlyTransactions] = await pool.query(`SELECT DATE_FORMAT(transaction_date, '%Y-%m') month, COUNT(*) transactions FROM transactions WHERE transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') ORDER BY month`);
    res.json({ ...Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Number(value)])), monthly_users: monthlyUsers.map((row) => ({ month: row.month, users: Number(row.users) })), monthly_transactions: monthlyTransactions.map((row) => ({ month: row.month, transactions: Number(row.transactions) })) });
  } catch (error) { next(error); }
}

async function listNotifications(req, res, next) {
  try { const [rows] = await pool.query('SELECT n.*, u.username FROM notifications n JOIN users u ON u.id=n.user_id ORDER BY n.created_at DESC, n.id DESC LIMIT 200'); res.json(rows); } catch (error) { next(error); }
}

async function createNotification(req, res, next) {
  try {
    requireFields(req.body, ['title', 'message']);
    const type = req.body.type || 'system';
    if (req.body.user_id) {
      const [result] = await pool.query('INSERT INTO notifications (user_id,type,title,message) VALUES (?,?,?,?)', [req.body.user_id, type, req.body.title.trim(), req.body.message.trim()]);
      const [rows] = await pool.query('SELECT * FROM notifications WHERE id=?', [result.insertId]);
      return res.status(201).json({ sent: 1, items: rows });
    }
    const [result] = await pool.query('INSERT INTO notifications (user_id,type,title,message) SELECT id,?,?,? FROM users WHERE status="active"', [type, req.body.title.trim(), req.body.message.trim()]);
    return res.status(201).json({ sent: result.affectedRows });
  } catch (error) { next(error); }
}

async function updateNotification(req, res, next) {
  try { requireFields(req.body, ['title', 'message']); const [result] = await pool.query('UPDATE notifications SET title=?,message=?,type=? WHERE id=?', [req.body.title.trim(), req.body.message.trim(), req.body.type || 'system', req.params.id]); if (!result.affectedRows) { const error = new Error('Không tìm thấy thông báo.'); error.status = 404; throw error; } const [rows] = await pool.query('SELECT * FROM notifications WHERE id=?', [req.params.id]); res.json(rows[0]); } catch (error) { next(error); }
}

async function removeNotification(req, res, next) {
  try { const [result] = await pool.query('DELETE FROM notifications WHERE id=?', [req.params.id]); if (!result.affectedRows) { const error = new Error('Không tìm thấy thông báo.'); error.status = 404; throw error; } res.status(204).end(); } catch (error) { next(error); }
}

async function listFeedback(req, res, next) {
  try { const params = []; let filter = ''; if (['pending', 'processing', 'resolved'].includes(req.query.status)) { filter = 'WHERE f.status=?'; params.push(req.query.status); } const [rows] = await pool.query(`SELECT f.*, u.full_name, u.email, u.username FROM feedback f JOIN users u ON u.id=f.user_id ${filter} ORDER BY f.created_at DESC, f.id DESC`, params); res.json(rows); } catch (error) { next(error); }
}

async function updateFeedback(req, res, next) {
  try { if (!['pending', 'processing', 'resolved'].includes(req.body.status)) { const error = new Error('Trạng thái phản hồi không hợp lệ.'); error.status = 400; throw error; } const [result] = await pool.query('UPDATE feedback SET status=?,admin_reply=? WHERE id=?', [req.body.status, req.body.admin_reply || null, req.params.id]); if (!result.affectedRows) { const error = new Error('Không tìm thấy phản hồi.'); error.status = 404; throw error; } const [rows] = await pool.query('SELECT f.*, u.full_name, u.email, u.username FROM feedback f JOIN users u ON u.id=f.user_id WHERE f.id=?', [req.params.id]); res.json(rows[0]); } catch (error) { next(error); }
}

module.exports = { dashboard, listUsers, detailUser, setUserStatus, removeUser, listCategories, createCategory, updateCategory, removeCategory, statistics, listNotifications, createNotification, updateNotification, removeNotification, listFeedback, updateFeedback };