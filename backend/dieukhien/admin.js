const pool = require('../cauhinh/database');
const { requireFields, assertType } = require('../tienich/validation');

const userFields = 'id,full_name,email,username,phone,avatar_url,role,status,created_at,updated_at';

async function dashboard(_req, res, next) {
  try {
    const [[row]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM users WHERE role='user') total_users,
      (SELECT COUNT(*) FROM users WHERE role='user' AND created_at>=DATE_FORMAT(CURRENT_DATE,'%Y-%m-01')) new_users,
      (SELECT COUNT(*) FROM users WHERE role='user' AND status='active') active_users,
      (SELECT COUNT(*) FROM transactions) total_transactions,
      (SELECT COUNT(*) FROM wallets) total_wallets,
      (SELECT COUNT(*) FROM system_categories) total_categories,
      (SELECT COUNT(*) FROM feedback WHERE status<>'resolved') pending_feedback`);
    res.json(Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)])));
  } catch (error) { next(error); }
}

async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const params = [];
    let where = "WHERE role='user'";
    if (req.query.search) {
      where += ' AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)';
      const search = `%${String(req.query.search).trim()}%`;
      params.push(search, search, search);
    }
    if (['active', 'locked'].includes(req.query.status)) { where += ' AND status=?'; params.push(req.query.status); }
    const [[count]] = await pool.query(`SELECT COUNT(*) total FROM users ${where}`, params);
    const offset = (page - 1) * limit;
    const [items] = await pool.query(`SELECT ${userFields} FROM users ${where} ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    res.json({ items, page, limit, total: Number(count.total), total_pages: Math.max(1, Math.ceil(Number(count.total) / limit)) });
  } catch (error) { next(error); }
}

async function detailUser(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT ${userFields} FROM users WHERE id=? AND role='user'`, [req.params.id]);
    if (!rows[0]) { const error = new Error('Không tìm thấy người dùng.'); error.status = 404; throw error; }
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function setUserStatus(req, res, next) {
  try {
    if (!['active', 'locked'].includes(req.body.status)) { const error = new Error('Trạng thái không hợp lệ.'); error.status = 400; throw error; }
    const [result] = await pool.query("UPDATE users SET status=? WHERE id=? AND role='user'", [req.body.status, req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy người dùng.'); error.status = 404; throw error; }
    return detailUser(req, res, next);
  } catch (error) { next(error); }
}

async function removeUser(req, res, next) {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id=? AND role='user'", [req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy người dùng.'); error.status = 404; throw error; }
    res.status(204).end();
  } catch (error) { next(error); }
}

async function listCategories(_req, res, next) {
  try { const [rows] = await pool.query('SELECT * FROM system_categories ORDER BY type,name'); res.json(rows); } catch (error) { next(error); }
}

async function createCategory(req, res, next) {
  try {
    requireFields(req.body, ['name', 'type']); assertType(req.body.type);
    const [result] = await pool.query('INSERT INTO system_categories (name,type,icon) VALUES (?,?,?)', [req.body.name.trim(), req.body.type, req.body.icon || null]);
    const [rows] = await pool.query('SELECT * FROM system_categories WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

async function updateCategory(req, res, next) {
  try {
    requireFields(req.body, ['name', 'type']); assertType(req.body.type);
    const [result] = await pool.query('UPDATE system_categories SET name=?,type=?,icon=? WHERE id=?', [req.body.name.trim(), req.body.type, req.body.icon || null, req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy danh mục hệ thống.'); error.status = 404; throw error; }
    const [rows] = await pool.query('SELECT * FROM system_categories WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function removeCategory(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM system_categories WHERE id=?', [req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy danh mục hệ thống.'); error.status = 404; throw error; }
    res.status(204).end();
  } catch (error) { next(error); }
}

async function statistics(_req, res, next) {
  try {
    const [[totals]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM users WHERE role='user') total_users,
      (SELECT COUNT(*) FROM transactions) total_transactions,
      (SELECT COUNT(*) FROM users WHERE role='user' AND created_at>=DATE_SUB(CURRENT_DATE,INTERVAL 30 DAY)) new_users_30_days`);
    const [monthlyUsers] = await pool.query("SELECT DATE_FORMAT(created_at,'%Y-%m') month,COUNT(*) users FROM users WHERE role='user' AND created_at>=DATE_SUB(CURRENT_DATE,INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY month");
    const [monthlyTransactions] = await pool.query("SELECT DATE_FORMAT(transaction_date,'%Y-%m') month,COUNT(*) transactions FROM transactions WHERE transaction_date>=DATE_SUB(CURRENT_DATE,INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(transaction_date,'%Y-%m') ORDER BY month");
    res.json({ ...Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Number(value)])), monthly_users: monthlyUsers.map((row) => ({ month: row.month, users: Number(row.users) })), monthly_transactions: monthlyTransactions.map((row) => ({ month: row.month, transactions: Number(row.transactions) })) });
  } catch (error) { next(error); }
}

async function listNotifications(req, res, next) {
  try {
    const params = []; let where = '';
    if (['draft', 'sent', 'archived'].includes(req.query.status)) { where = 'WHERE n.status=?'; params.push(req.query.status); }
    const [rows] = await pool.query(`SELECT n.*,u.full_name created_by_name FROM system_notifications n JOIN users u ON u.id=n.created_by ${where} ORDER BY n.created_at DESC,n.id DESC`, params);
    res.json(rows);
  } catch (error) { next(error); }
}

async function createNotification(req, res, next) {
  try {
    requireFields(req.body, ['title', 'message']);
    const [result] = await pool.query('INSERT INTO system_notifications (title,message,type,status,created_by) VALUES (?,?,?,?,?)', [req.body.title.trim(), req.body.message.trim(), req.body.type || 'system', 'draft', req.user.id]);
    if (req.body.send_now) { req.params.id = result.insertId; return sendNotification(req, res, next); }
    const [rows] = await pool.query('SELECT * FROM system_notifications WHERE id=?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

async function updateNotification(req, res, next) {
  try {
    requireFields(req.body, ['title', 'message']);
    const status = ['draft', 'sent', 'archived'].includes(req.body.status) ? req.body.status : 'draft';
    const [result] = await pool.query('UPDATE system_notifications SET title=?,message=?,type=?,status=? WHERE id=?', [req.body.title.trim(), req.body.message.trim(), req.body.type || 'system', status, req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy thông báo hệ thống.'); error.status = 404; throw error; }
    await pool.query('UPDATE notifications SET title=?,message=?,type=? WHERE dedupe_key=?', [req.body.title.trim(), req.body.message.trim(), req.body.type || 'system', `system_${req.params.id}`]);
    const [rows] = await pool.query('SELECT * FROM system_notifications WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function sendNotification(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT * FROM system_notifications WHERE id=? FOR UPDATE', [req.params.id]);
    const item = rows[0];
    if (!item) { const error = new Error('Không tìm thấy thông báo hệ thống.'); error.status = 404; throw error; }
    const [result] = await connection.query('INSERT IGNORE INTO notifications (user_id,type,title,message,dedupe_key) SELECT id,?,?,?,? FROM users WHERE role="user" AND status="active"', [item.type, item.title, item.message, `system_${item.id}`]);
    await connection.query("UPDATE system_notifications SET status='sent',sent_at=COALESCE(sent_at,NOW()) WHERE id=?", [item.id]);
    await connection.commit();
    res.json({ message: 'Đã gửi thông báo tới người dùng đang hoạt động.', sent: result.affectedRows });
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
}

async function removeNotification(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM notifications WHERE dedupe_key=?', [`system_${req.params.id}`]);
    const [result] = await connection.query('DELETE FROM system_notifications WHERE id=?', [req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy thông báo hệ thống.'); error.status = 404; throw error; }
    await connection.commit(); res.status(204).end();
  } catch (error) { await connection.rollback(); next(error); } finally { connection.release(); }
}

async function listFeedback(req, res, next) {
  try {
    const params = []; let where = '';
    if (['pending', 'processing', 'resolved'].includes(req.query.status)) { where = 'WHERE f.status=?'; params.push(req.query.status); }
    const [rows] = await pool.query(`SELECT f.*,u.full_name,u.email,u.username FROM feedback f JOIN users u ON u.id=f.user_id ${where} ORDER BY f.created_at DESC,f.id DESC`, params);
    res.json(rows);
  } catch (error) { next(error); }
}

async function updateFeedback(req, res, next) {
  try {
    if (!['pending', 'processing', 'resolved'].includes(req.body.status)) { const error = new Error('Trạng thái phản hồi không hợp lệ.'); error.status = 400; throw error; }
    const [result] = await pool.query('UPDATE feedback SET status=?,admin_reply=? WHERE id=?', [req.body.status, req.body.admin_reply || null, req.params.id]);
    if (!result.affectedRows) { const error = new Error('Không tìm thấy phản hồi.'); error.status = 404; throw error; }
    const [rows] = await pool.query('SELECT f.*,u.full_name,u.email,u.username FROM feedback f JOIN users u ON u.id=f.user_id WHERE f.id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
}

async function listSessions(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id,ip_address,user_agent,created_at,last_used_at,expires_at,revoked_at FROM admin_sessions WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows.map((row) => ({ ...row, current: Number(row.id) === Number(req.sessionId) })));
  } catch (error) { next(error); }
}

async function revokeSession(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE admin_sessions SET revoked_at=NOW() WHERE id=? AND user_id=? AND revoked_at IS NULL', [req.params.id, req.user.id]);
    if (!result.affectedRows) { const error = new Error('Phiên đăng nhập không tồn tại hoặc đã kết thúc.'); error.status = 404; throw error; }
    res.json({ message: 'Đã đăng xuất phiên quản trị.' });
  } catch (error) { next(error); }
}

async function revokeOtherSessions(req, res, next) {
  try {
    const [result] = await pool.query('UPDATE admin_sessions SET revoked_at=NOW() WHERE user_id=? AND id<>? AND revoked_at IS NULL', [req.user.id, req.sessionId]);
    res.json({ message: 'Đã đăng xuất các phiên khác.', revoked: result.affectedRows });
  } catch (error) { next(error); }
}

async function logout(req, res, next) {
  try { await pool.query('UPDATE admin_sessions SET revoked_at=NOW() WHERE id=? AND user_id=?', [req.sessionId, req.user.id]); res.json({ message: 'Đăng xuất thành công.' }); } catch (error) { next(error); }
}

module.exports = {
  dashboard, listUsers, detailUser, setUserStatus, removeUser,
  listCategories, createCategory, updateCategory, removeCategory,
  statistics, listNotifications, createNotification, updateNotification, sendNotification, removeNotification,
  listFeedback, updateFeedback, listSessions, revokeSession, revokeOtherSessions, logout,
};
