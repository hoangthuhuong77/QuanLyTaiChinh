// Xu ly vitien.
const pool = require('../cauhinh/database');
const { requireFields } = require('../tienich/validation');

async function list(req, res, next) { try { const [rows] = await pool.query('SELECT * FROM wallets WHERE user_id=? ORDER BY created_at DESC', [req.user.id]); res.json(rows); } catch (e) { next(e); } }
async function detail(req, res, next) { try { const [rows] = await pool.query('SELECT * FROM wallets WHERE id=? AND user_id=?', [req.params.id, req.user.id]); if (!rows[0]) { const e = new Error('Không tìm thấy ví.'); e.status=404; throw e; } res.json(rows[0]); } catch(e){next(e);} }
async function create(req,res,next){try{requireFields(req.body,['name','type']); const balance=Number(req.body.initial_balance||0); if(!Number.isFinite(balance)){const e=new Error('Số dư không hợp lệ.');e.status=400;throw e;} const [r]=await pool.query('INSERT INTO wallets (user_id,name,type,initial_balance,current_balance,description) VALUES (?,?,?,?,?,?)',[req.user.id,req.body.name.trim(),req.body.type,balance,balance,req.body.description||null]); req.params.id=r.insertId; return detail(req,res,next);}catch(e){next(e);}}
async function update(req,res,next){try{requireFields(req.body,['name','type']); await pool.query('UPDATE wallets SET name=?,type=?,description=? WHERE id=? AND user_id=?',[req.body.name.trim(),req.body.type,req.body.description||null,req.params.id,req.user.id]); return detail(req,res,next);}catch(e){next(e);}}
async function remove(req,res,next){try{const [r]=await pool.query('DELETE FROM wallets WHERE id=? AND user_id=?',[req.params.id,req.user.id]);if(!r.affectedRows){const e=new Error('Không tìm thấy ví.');e.status=404;throw e;}res.status(204).end();}catch(e){if(e.code==='ER_ROW_IS_REFERENCED_2'){e.status=409;e.message='Không thể xóa ví đã có giao dịch.';}next(e);}}
module.exports={list,detail,create,update,remove};
