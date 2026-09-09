const pool = require('../cauhinh/database');
const { requireFields, positiveMoney } = require('../tienich/validation');

async function list(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT tr.*, source.name from_wallet_name, destination.name to_wallet_name
       FROM transfers tr
       JOIN wallets source ON source.id=tr.from_wallet_id
       JOIN wallets destination ON destination.id=tr.to_wallet_id
       WHERE tr.user_id=? ORDER BY tr.transfer_date DESC,tr.id DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  const connection = await pool.getConnection();
  try {
    requireFields(req.body, ['from_wallet_id', 'to_wallet_id', 'amount', 'transfer_date']);
    const fromId = Number(req.body.from_wallet_id);
    const toId = Number(req.body.to_wallet_id);
    const amount = positiveMoney(req.body.amount);
    if (fromId === toId) { const error = new Error('Ví nguồn và ví đích phải khác nhau.'); error.status=400; throw error; }
    await connection.beginTransaction();
    // Khóa theo thứ tự id cố định để tránh deadlock khi có nhiều yêu cầu đồng thời.
    const ids = [fromId, toId].sort((a, b) => a - b);
    const [wallets] = await connection.query('SELECT id,current_balance FROM wallets WHERE id IN (?,?) AND user_id=? ORDER BY id FOR UPDATE', [ids[0], ids[1], req.user.id]);
    if (wallets.length !== 2) { const error = new Error('Ví nguồn hoặc ví đích không hợp lệ.'); error.status=400; throw error; }
    const source = wallets.find((wallet) => Number(wallet.id) === fromId);
    if (Number(source.current_balance) < amount) { const error = new Error('Số dư ví nguồn không đủ.'); error.status=400; throw error; }
    await connection.query('UPDATE wallets SET current_balance=current_balance-? WHERE id=?', [amount, fromId]);
    await connection.query('UPDATE wallets SET current_balance=current_balance+? WHERE id=?', [amount, toId]);
    const [result] = await connection.query('INSERT INTO transfers (user_id,from_wallet_id,to_wallet_id,amount,description,transfer_date) VALUES (?,?,?,?,?,?)', [req.user.id, fromId, toId, amount, req.body.description || null, req.body.transfer_date]);
    await connection.commit();
    res.status(201).json({ id:result.insertId, message:'Chuyển tiền thành công.' });
  } catch (error) { await connection.rollback(); next(error); }
  finally { connection.release(); }
}

module.exports = { list, create };
