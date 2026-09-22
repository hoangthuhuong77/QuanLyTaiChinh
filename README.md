# Ứng dụng Quản lý Tài chính Cá nhân

Ứng dụng gồm ba phần độc lập:

- `admin-web`: trang quản trị chạy trên trình duyệt bằng ReactJS và Vite.
- `src`: ứng dụng người dùng chạy trên điện thoại bằng Expo/React Native.
- `backend`: API dùng chung chạy bằng Express.js, MySQL và JWT.

## Chạy trang quản trị

Mở hai Terminal:

```powershell
# Terminal 1: API và MySQL
cd D:\quanlytaichinh\thu-huong\backend
npm.cmd run dev

# Terminal 2: Web Admin
cd D:\quanlytaichinh\thu-huong\admin-web
npm.cmd run dev
```

Sau đó mở `http://localhost:5173`. Tài khoản đăng nhập phải có quyền `admin`; tài khoản người dùng thường sẽ không được vào trang này.

Khi backend chạy lần đầu, hệ thống tự tạo tài khoản Admin mặc định nếu tài khoản này chưa tồn tại:

```text
Tên đăng nhập: huong
Mật khẩu: 12345678
```

Có thể đổi thông tin khởi tạo bằng các biến `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` và `ADMIN_FULL_NAME` trong `backend/.env`. Nếu Admin đã tồn tại thì backend không đặt lại mật khẩu, nên việc đổi mật khẩu trong Web Admin vẫn được giữ nguyên.

Web Admin có: Dashboard, quản lý người dùng, danh mục mặc định, thông báo hệ thống, phản hồi/hỗ trợ, thống kê, cập nhật tài khoản và quản lý phiên đăng nhập. Admin không được xem mật khẩu, token hoặc chi tiết tiền riêng của từng người dùng.

## Chạy ứng dụng người dùng trên điện thoại

Sau khi backend đang chạy, mở Terminal thứ ba:

```powershell
cd D:\quanlytaichinh\thu-huong
npx.cmd expo start --tunnel
```

Mở Expo Go trên điện thoại và quét mã QR. Phần Admin cũ đã được loại khỏi ứng dụng điện thoại vì Admin chỉ chạy trên web.

## Chạy hệ thống

1. Import `backend/database.sql` bằng MySQL Workbench.
2. Sao chép `backend/.env.example` thành `backend/.env`, điền thông tin MySQL và một `JWT_SECRET` mạnh.
3. Trong `backend`, chạy `npm install` rồi `npm run dev`.
4. Sao chép `.env.example` thành `.env`. Với điện thoại thật, thay IP mẫu bằng IP LAN của máy chạy backend.
5. Ở thư mục gốc, chạy `npm install` rồi `npm start`.

Android Emulator tự dùng `http://10.0.2.2:3000/api`; iOS Simulator và web tự dùng `http://localhost:3000/api` nếu không đặt `EXPO_PUBLIC_API_URL`.

## API

Health check: `GET /api/health`. Các nhóm API xác thực, ví, danh mục, giao dịch, thống kê, ngân sách và mục tiêu tiết kiệm nằm trong `backend/duongdan`.

Trang Swagger: `http://localhost:3000/api/docs/`. Swagger liệt kê toàn bộ API và có nút **Try it out** để xem dữ liệu thật. Để xem dữ liệu cá nhân, gọi `POST /api/dangnhap` bằng tài khoản của bạn, sao chép `token` trong phản hồi, bấm **Authorize**, dán token (không thêm `Bearer`), rồi thử các lệnh `GET`. Các lệnh `POST`, `PUT`, `DELETE` sẽ thay đổi dữ liệu thật, nên chỉ dùng khi bạn muốn tạo/sửa/xóa. Đặc tả OpenAPI dạng JSON nằm ở `GET /api/openapi.json`.

Địa chỉ hiển thị trên Swagger dùng tiếng Việt không dấu cho dễ đọc: ví dụ `POST /api/dangnhap`, `GET /api/giaodich`, `GET /api/vitien`. Các địa chỉ tiếng Anh cũ vẫn hoạt động để app mobile không bị ảnh hưởng. Tên trường JSON như `login`, `password`, `amount` chưa đổi vì app đang dùng chúng.

Trong `backend/duongdan` và `backend/dieukhien`, tên file cũng dùng tiếng Việt không dấu như `taikhoan.js`, `giaodich.js`, `vitien.js`, `ngansach.js`. Hai thư mục có file cùng tên: `duongdan` khai báo địa chỉ API, còn `dieukhien` xử lý dữ liệu.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
