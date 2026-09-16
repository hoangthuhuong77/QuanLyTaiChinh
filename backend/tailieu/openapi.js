const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name) => ({ type: 'array', items: ref(name) });
const response = (schema, description = 'Thành công') => ({ description, content: { 'application/json': { schema } } });
const body = (name) => ({ required: true, content: { 'application/json': { schema: ref(name) } } });
const param = (name, where, description, schema = { type: 'string' }) => ({ name, in: where, description, required: where === 'path', schema });
const id = param('id', 'path', 'Mã bản ghi', { type: 'integer', minimum: 1 });
const date = (name) => param(name, 'query', `Ngày ${name === 'start_date' ? 'bắt đầu' : 'kết thúc'} (YYYY-MM-DD)`, { type: 'string', format: 'date' });
const money = { type: 'number', format: 'double', example: 500000 };
const transactionType = { type: 'string', enum: ['income', 'expense'] };
const message = response(ref('Message'));
const noContent = { description: 'Đã xóa thành công' };
const unauthorized = { description: 'Thiếu token hoặc token không hợp lệ' };
const common = { '401': unauthorized };
const secured = (tag, summary, extra = {}) => ({ tags: [tag], summary, security: [{ bearerAuth: [] }], ...extra, responses: { ...extra.responses, ...common } });
const publicOperation = (tag, summary, extra = {}) => ({ tags: [tag], summary, ...extra });

const schemas = {
  Message: { type: 'object', properties: { id: { type: 'integer' }, message: { type: 'string' } } },
  Error: { type: 'object', properties: { message: { type: 'string' } } },
  User: { type: 'object', properties: { id: { type: 'integer' }, full_name: { type: 'string' }, email: { type: 'string', format: 'email' }, username: { type: 'string' }, phone: { type: 'string', nullable: true }, avatar_url: { type: 'string', nullable: true }, created_at: { type: 'string', format: 'date-time' } } },
  AuthResponse: { type: 'object', properties: { token: { type: 'string', description: 'Dán giá trị này vào nút Authorize, không thêm chữ Bearer.' }, user: ref('User') } },
  RegisterInput: { type: 'object', required: ['full_name', 'email', 'username', 'password'], properties: { full_name: { type: 'string', example: 'Nguyễn Văn A' }, email: { type: 'string', format: 'email', example: 'ban@example.com' }, username: { type: 'string', example: 'nguyenvana' }, password: { type: 'string', format: 'password', minLength: 6, example: 'matkhau123' }, phone: { type: 'string', example: '0901234567' } } },
  LoginInput: { type: 'object', required: ['login', 'password'], properties: { login: { type: 'string', description: 'Email hoặc tên đăng nhập', example: 'ban@example.com' }, password: { type: 'string', format: 'password', example: 'matkhau123' } } },
  ProfileInput: { type: 'object', required: ['full_name', 'email', 'username'], properties: { full_name: { type: 'string' }, email: { type: 'string', format: 'email' }, username: { type: 'string' }, phone: { type: 'string', nullable: true }, avatar_url: { type: 'string', nullable: true, description: 'Ảnh dạng data:image/...;base64,...; để trống để xóa ảnh' } } },
  PasswordInput: { type: 'object', required: ['current_password', 'new_password'], properties: { current_password: { type: 'string', format: 'password' }, new_password: { type: 'string', format: 'password', minLength: 6 } } },
  Wallet: { type: 'object', properties: { id: { type: 'integer' }, user_id: { type: 'integer' }, name: { type: 'string' }, type: { type: 'string', enum: ['cash', 'bank', 'e-wallet', 'saving'] }, initial_balance: money, current_balance: money, description: { type: 'string', nullable: true }, created_at: { type: 'string', format: 'date-time' } } },
  WalletInput: { type: 'object', required: ['name', 'type'], properties: { name: { type: 'string', example: 'Ví tiền mặt' }, type: { type: 'string', enum: ['cash', 'bank', 'e-wallet', 'saving'], example: 'cash' }, initial_balance: { ...money, description: 'Chỉ dùng khi tạo ví; số dư sau đó thay đổi qua giao dịch/chuyển tiền' }, description: { type: 'string' } } },
  Category: { type: 'object', properties: { id: { type: 'integer' }, user_id: { type: 'integer' }, name: { type: 'string' }, type: transactionType, icon: { type: 'string', nullable: true }, created_at: { type: 'string', format: 'date-time' } } },
  CategoryInput: { type: 'object', required: ['name', 'type'], properties: { name: { type: 'string', example: 'Ăn uống' }, type: { ...transactionType, example: 'expense' }, icon: { type: 'string', example: '🍜' } } },
  Transaction: { type: 'object', properties: { id: { type: 'integer' }, wallet_id: { type: 'integer' }, category_id: { type: 'integer' }, type: transactionType, amount: money, description: { type: 'string', nullable: true }, transaction_date: { type: 'string', format: 'date-time' }, wallet_name: { type: 'string' }, category_name: { type: 'string' }, category_icon: { type: 'string', nullable: true } } },
  TransactionInput: { type: 'object', required: ['wallet_id', 'category_id', 'type', 'amount', 'transaction_date'], properties: { wallet_id: { type: 'integer', example: 1 }, category_id: { type: 'integer', example: 1 }, type: { ...transactionType, example: 'expense' }, amount: { ...money, minimum: 0.01 }, description: { type: 'string', example: 'Bữa trưa' }, transaction_date: { type: 'string', format: 'date-time', example: '2026-09-15 12:00:00' } } },
  Transfer: { type: 'object', properties: { id: { type: 'integer' }, from_wallet_id: { type: 'integer' }, to_wallet_id: { type: 'integer' }, from_wallet_name: { type: 'string' }, to_wallet_name: { type: 'string' }, amount: money, description: { type: 'string', nullable: true }, transfer_date: { type: 'string', format: 'date-time' }, created_at: { type: 'string', format: 'date-time' } } },
  TransferInput: { type: 'object', required: ['from_wallet_id', 'to_wallet_id', 'amount', 'transfer_date'], properties: { from_wallet_id: { type: 'integer', example: 1 }, to_wallet_id: { type: 'integer', example: 2 }, amount: { ...money, minimum: 0.01 }, description: { type: 'string', example: 'Chuyển sang ngân hàng' }, transfer_date: { type: 'string', format: 'date-time', example: '2026-09-15 12:00:00' } } },
  Budget: { type: 'object', properties: { id: { type: 'integer' }, category_id: { type: 'integer' }, category_name: { type: 'string' }, icon: { type: 'string' }, amount_limit: money, month: { type: 'integer' }, year: { type: 'integer' }, spent: money, remaining: money, progress: { type: 'number', description: 'Phần trăm đã sử dụng' } } },
  BudgetInput: { type: 'object', required: ['category_id', 'amount_limit', 'month', 'year'], properties: { category_id: { type: 'integer', example: 1 }, amount_limit: { ...money, minimum: 0.01, example: 2000000 }, month: { type: 'integer', minimum: 1, maximum: 12, example: 9 }, year: { type: 'integer', example: 2026 } } },
  Goal: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, target_amount: money, current_amount: money, deadline: { type: 'string', format: 'date', nullable: true }, status: { type: 'string', enum: ['active', 'completed', 'paused'] }, progress: { type: 'number' } } },
  GoalInput: { type: 'object', required: ['name', 'target_amount'], properties: { name: { type: 'string', example: 'Mua laptop' }, target_amount: { ...money, minimum: 0.01, example: 20000000 }, current_amount: { ...money, example: 12000000 }, deadline: { type: 'string', format: 'date', nullable: true, example: '2027-06-30' }, status: { type: 'string', enum: ['active', 'completed', 'paused'] } } },
  Overview: { type: 'object', properties: { total_income: money, total_expense: money, total_balance: money, remaining: money, recent: arrayOf('Transaction') } },
  CategoryStatistic: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, icon: { type: 'string' }, type: transactionType, total: money } },
  MonthlyStatistic: { type: 'object', properties: { month: { type: 'integer' }, income: money, expense: money } },
  Notification: { type: 'object', properties: { id: { type: 'integer' }, type: { type: 'string' }, title: { type: 'string' }, message: { type: 'string' }, is_read: { type: 'boolean' }, created_at: { type: 'string', format: 'date-time' } } },
  NotificationsResponse: { type: 'object', properties: { items: arrayOf('Notification'), unread_count: { type: 'integer' } } },
};

const crud = ({ tag, base, resource, input, detail = false }) => {
  const paths = {
    [base]: {
      get: secured(tag, `Xem danh sách ${tag.toLowerCase()} của tài khoản đang đăng nhập`, { responses: { '200': response(arrayOf(resource)) } }),
      post: secured(tag, `Tạo ${tag.toLowerCase()}`, { requestBody: body(input), responses: { '200': response(ref(resource)), '201': response(ref(resource)) } }),
    },
    [`${base}/{id}`]: {
      put: secured(tag, `Sửa ${tag.toLowerCase()}`, { parameters: [id], requestBody: body(input), responses: { '200': response(ref(resource)), '404': { description: 'Không tìm thấy bản ghi' } } }),
      delete: secured(tag, `Xóa ${tag.toLowerCase()}`, { parameters: [id], responses: { '204': noContent, '404': { description: 'Không tìm thấy bản ghi' }, '409': { description: 'Bản ghi đang được sử dụng' } } }),
    },
  };
  if (detail) paths[`${base}/{id}`].get = secured(tag, `Xem chi tiết ${tag.toLowerCase()}`, { parameters: [id], responses: { '200': response(ref(resource)), '404': { description: 'Không tìm thấy bản ghi' } } });
  return paths;
};

const paths = {
  '/api/health': { get: publicOperation('Hệ thống', 'Kiểm tra backend và kết nối MySQL', { responses: { '200': response({ type: 'object', properties: { status: { type: 'string', example: 'ok' } } }) } }) },
  '/api/auth/register': { post: publicOperation('Tài khoản', 'Đăng ký tài khoản mới', { requestBody: body('RegisterInput'), responses: { '201': response(ref('AuthResponse')) } }) },
  '/api/auth/login': { post: publicOperation('Tài khoản', 'Đăng nhập để lấy token JWT', { description: 'Sau khi bấm Execute, sao chép giá trị token trong Response body, bấm Authorize ở đầu trang và dán token (không thêm Bearer).', requestBody: body('LoginInput'), responses: { '200': response(ref('AuthResponse')), '401': { description: 'Sai tài khoản hoặc mật khẩu' } } }) },
  '/api/auth/profile': { get: secured('Tài khoản', 'Xem thông tin tài khoản', { responses: { '200': response(ref('User')) } }), put: secured('Tài khoản', 'Cập nhật hồ sơ', { requestBody: body('ProfileInput'), responses: { '200': response(ref('User')) } }) },
  '/api/auth/change-password': { put: secured('Tài khoản', 'Đổi mật khẩu', { requestBody: body('PasswordInput'), responses: { '200': message } }) },
  ...crud({ tag: 'Ví tiền', base: '/api/wallets', resource: 'Wallet', input: 'WalletInput', detail: true }),
  ...crud({ tag: 'Danh mục', base: '/api/categories', resource: 'Category', input: 'CategoryInput' }),
  ...crud({ tag: 'Giao dịch', base: '/api/transactions', resource: 'Transaction', input: 'TransactionInput', detail: true }),
  ...crud({ tag: 'Ngân sách', base: '/api/budgets', resource: 'Budget', input: 'BudgetInput' }),
  ...crud({ tag: 'Mục tiêu tiết kiệm', base: '/api/savings-goals', resource: 'Goal', input: 'GoalInput' }),
  '/api/transfers': { get: secured('Chuyển tiền', 'Xem lịch sử chuyển tiền', { responses: { '200': response(arrayOf('Transfer')) } }), post: secured('Chuyển tiền', 'Chuyển tiền giữa hai ví', { description: 'Trừ ví nguồn, cộng ví đích và lưu lịch sử trong một giao dịch MySQL. Ví nguồn phải đủ tiền.', requestBody: body('TransferInput'), responses: { '201': message, '400': { description: 'Ví hoặc số tiền không hợp lệ' } } }) },
  '/api/statistics/overview': { get: secured('Thống kê', 'Tổng thu, tổng chi, số dư ví và 10 giao dịch gần đây', { description: 'Mặc định tính thu/chi tháng hiện tại. Đặt all=true hoặc khoảng ngày để xem thời gian khác.', parameters: [date('start_date'), date('end_date'), param('all', 'query', 'true để tính thu/chi tất cả thời gian', { type: 'boolean' })], responses: { '200': response(ref('Overview')) } }) },
  '/api/statistics/category': { get: secured('Thống kê', 'Thu/chi theo danh mục', { parameters: [date('start_date'), date('end_date')], responses: { '200': response(arrayOf('CategoryStatistic')) } }) },
  '/api/statistics/monthly': { get: secured('Thống kê', 'Thu/chi theo tháng trong năm', { parameters: [param('year', 'query', 'Năm cần xem', { type: 'integer', example: 2026 })], responses: { '200': response(arrayOf('MonthlyStatistic')) } }) },
  '/api/notifications': { get: secured('Thông báo', 'Xem thông báo và số chưa đọc', { responses: { '200': response(ref('NotificationsResponse')) } }) },
  '/api/notifications/read-all': { put: secured('Thông báo', 'Đánh dấu tất cả đã đọc', { responses: { '200': message } }) },
  '/api/notifications/{id}/read': { put: secured('Thông báo', 'Đánh dấu một thông báo đã đọc', { parameters: [id], responses: { '200': message, '404': { description: 'Không tìm thấy thông báo' } } }) },
  '/api/notifications/{id}': { delete: secured('Thông báo', 'Xóa thông báo', { parameters: [id], responses: { '204': noContent, '404': { description: 'Không tìm thấy thông báo' } } }) },
};

paths['/api/categories'].get.parameters = [param('type', 'query', 'Lọc theo khoản thu hoặc khoản chi', transactionType)];
paths['/api/transactions'].get.parameters = [
  param('type', 'query', 'Loại giao dịch', transactionType),
  param('category_id', 'query', 'Mã danh mục', { type: 'integer' }),
  param('wallet_id', 'query', 'Mã ví', { type: 'integer' }),
  date('start_date'), date('end_date'),
  param('search', 'query', 'Tìm trong ghi chú, danh mục hoặc tên ví'),
];
paths['/api/budgets'].post.responses = { '201': message, '401': unauthorized };
paths['/api/budgets/{id}'].put.responses = { '200': message, '401': unauthorized, '404': { description: 'Không tìm thấy bản ghi' } };
paths['/api/savings-goals'].post.responses = { '201': message, '401': unauthorized };
paths['/api/savings-goals/{id}'].put.responses = { '200': message, '401': unauthorized, '404': { description: 'Không tìm thấy bản ghi' } };

// Swagger chi hien thi dia chi tieng Viet; dia chi tieng Anh cu van hoat dong cho app mobile.
const tenTiengViet = {
  '/api/auth/register': '/api/dangky',
  '/api/auth/login': '/api/dangnhap',
  '/api/auth/profile': '/api/taikhoan/hoso',
  '/api/auth/change-password': '/api/taikhoan/doimatkhau',
  '/api/statistics/overview': '/api/thongke/tongquan',
  '/api/statistics/category': '/api/thongke/danhmuc',
  '/api/statistics/monthly': '/api/thongke/hangthang',
  '/api/notifications/read-all': '/api/thongbao/doctatca',
  '/api/notifications/{id}/read': '/api/thongbao/{id}/dadoc',
};
const nhomTiengViet = {
  '/api/wallets': '/api/vitien',
  '/api/categories': '/api/danhmuc',
  '/api/transactions': '/api/giaodich',
  '/api/transfers': '/api/chuyentien',
  '/api/budgets': '/api/ngansach',
  '/api/savings-goals': '/api/muctieutietkiem',
  '/api/notifications': '/api/thongbao',
};
for (const [duongDanCu, thaoTac] of Object.entries(paths)) {
  const nhom = Object.entries(nhomTiengViet).find(([prefix]) => duongDanCu === prefix || duongDanCu.startsWith(`${prefix}/`));
  const duongDanMoi = tenTiengViet[duongDanCu] || (nhom ? duongDanCu.replace(nhom[0], nhom[1]) : duongDanCu);
  if (duongDanMoi !== duongDanCu) {
    paths[duongDanMoi] = thaoTac;
    delete paths[duongDanCu];
  }
}

module.exports = {
  openapi: '3.0.3',
  info: { title: 'API Quản lý tài chính cá nhân', version: '1.0.0', description: 'Các địa chỉ API trên trang này dùng tiếng Việt không dấu để dễ đọc. Địa chỉ tiếng Anh cũ vẫn chạy cho app mobile. Dữ liệu trả về từ MySQL thật khi bấm Try it out → Execute. Cách xem: 1) POST /api/dangnhap; 2) sao chép token; 3) bấm Authorize và dán token, không thêm chữ Bearer; 4) mở các GET để xem ví, giao dịch, ngân sách, mục tiêu, thống kê. Mỗi tài khoản chỉ xem được dữ liệu của mình. Tránh bấm POST/PUT/DELETE nếu chỉ muốn xem.' },
  servers: [{ url: '/', description: 'Backend hiện tại' }],
  tags: ['Hệ thống', 'Tài khoản', 'Ví tiền', 'Danh mục', 'Giao dịch', 'Chuyển tiền', 'Ngân sách', 'Mục tiêu tiết kiệm', 'Thống kê', 'Thông báo'].map(name => ({ name })),
  paths,
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Dán token nhận từ POST /api/dangnhap, không thêm Bearer.' } }, schemas },
};
