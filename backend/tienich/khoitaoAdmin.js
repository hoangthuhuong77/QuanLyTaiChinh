const bcrypt = require('bcryptjs');
const pool = require('../cauhinh/database');

async function khoiTaoAdminMacDinh() {
  const username = (process.env.ADMIN_USERNAME || 'huong').trim();
  const password = process.env.ADMIN_PASSWORD || '12345678';
  const email = (process.env.ADMIN_EMAIL || 'admin@quanlytaichinh.local').trim().toLowerCase();
  const fullName = (process.env.ADMIN_FULL_NAME || 'Quản trị viên').trim();

  const [rows] = await pool.query(
    'SELECT id, username, email, role FROM users WHERE username=? OR email=? LIMIT 1',
    [username, email],
  );

  if (rows.length) {
    const account = rows[0];
    if (account.username !== username) {
      throw new Error(`Email khởi tạo Admin đã thuộc tài khoản ${account.username}.`);
    }
    if (account.role !== 'admin') {
      const passwordHash = await bcrypt.hash(password, 12);
      await pool.query(
        "UPDATE users SET full_name=?, email=?, password=?, role='admin', status='active' WHERE id=?",
        [fullName, email, passwordHash, account.id],
      );
      console.log(`Đã cấp quyền Admin mặc định cho tài khoản ${username}.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    "INSERT INTO users (full_name,email,username,password,role,status) VALUES (?,?,?,?,'admin','active')",
    [fullName, email, username, passwordHash],
  );
  console.log(`Đã tạo tài khoản Admin mặc định: ${username}.`);
}

module.exports = khoiTaoAdminMacDinh;
