const pool = require('../cauhinh/database');

async function list(req, res, next) {
  try {
    const [items] = await pool.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC,id DESC', [req.user.id]);
    const [[count]] = await pool.query('SELECT COUNT(*) unread_count FROM notifications WHERE user_id=? AND is_read=FALSE', [req.user.id]);
    res.json({ items, unread_count:Number(count.unread_count) });
  } catch (error) { next(error); }
}
async function markRead(req,res,next){try{const [result]=await pool.query('UPDATE notifications SET is_read=TRUE WHERE id=? AND user_id=?',[req.params.id,req.user.id]);if(!result.affectedRows){const error=new Error('Không tìm thấy thông báo.');error.status=404;throw error;}res.json({message:'Đã đánh dấu đã đọc.'});}catch(error){next(error);}}
async function markAllRead(req,res,next){try{await pool.query('UPDATE notifications SET is_read=TRUE WHERE user_id=?',[req.user.id]);res.json({message:'Đã đọc tất cả thông báo.'});}catch(error){next(error);}}
async function remove(req,res,next){try{const [result]=await pool.query('DELETE FROM notifications WHERE id=? AND user_id=?',[req.params.id,req.user.id]);if(!result.affectedRows){const error=new Error('Không tìm thấy thông báo.');error.status=404;throw error;}res.status(204).end();}catch(error){next(error);}}
module.exports={list,markRead,markAllRead,remove};
