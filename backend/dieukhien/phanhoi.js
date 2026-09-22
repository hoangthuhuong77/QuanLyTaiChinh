const pool = require('../cauhinh/database');
const { requireFields } = require('../tienich/validation');

const types = ['bug', 'suggestion', 'support'];

async function create(req, res, next) {
  try {
    requireFields(req.body, ['type', 'subject', 'message']);
    if (!types.includes(req.body.type)) { const error = new Error('Loại phản hồi không hợp lệ.'); error.status = 400; throw error; }
    const [result] = await pool.query('INSERT INTO feedback (user_id,type,subject,message) VALUES (?,?,?,?)', [req.user.id, req.body.type, req.body.subject.trim(), req.body.message.trim()]);
    const [rows] = await pool.query('SELECT * FROM feedback WHERE id=? AND user_id=?', [result.insertId, req.user.id]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
}

async function list(req, res, next) {
  try { const [rows] = await pool.query('SELECT * FROM feedback WHERE user_id=? ORDER BY created_at DESC, id DESC', [req.user.id]); res.json(rows); } catch (error) { next(error); }
}

module.exports = { create, list };