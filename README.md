# 🏨 Hotel Booking API (Backend)

[![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-6.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x+-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

API Backend vững chắc, chịu tải tốt, quản lý và vận hành toàn bộ luồng nghiệp vụ của Hệ Thống Khách Sạn. Dự án được phát triển bằng **Node.js**, **Express.js (v5)**, **TypeScript (Strict Type Checking)**, kết hợp cùng **Prisma ORM** kết nối cơ sở dữ liệu **PostgreSQL** hiệu năng cao.

Hệ thống tích hợp quy trình nghiệp vụ đặt phòng chặt chẽ chống Race Conditions, bảo mật đa lớp (RBAC), thanh toán trực tuyến, dịch vụ gửi mail OTP tự động, và hệ thống tác vụ chạy nền (Cron Jobs) tự động tối ưu hóa trạng thái vận hành của khách sạn.

---

## ✨ Các Nghiệp Vụ & Tính Năng Đã Hoàn Thành (Core Features)

### 1. 🔐 Xác Thực Đa Lớp & Phân Quyền Vai Trò (RBAC)
* **JWT & Cookie Security**: Sử dụng giải pháp xác thực qua chứng chỉ **JSON Web Token (JWT)**, được lưu trữ bảo mật qua cookie chống tấn công XSS/CSRF.
* **OTP Verification Email**: Tích hợp gửi mã OTP xác nhận tài khoản khi Đăng ký mới, hoặc khi khách hàng muốn Khôi phục mật khẩu thông qua thư viện gửi mail tự động (`nodemailer` & `resend`).
* **Phân quyền chặt chẽ (RBAC)**: Định nghĩa rõ ràng 3 phân quyền hệ thống:
  * `ADMIN`: Quản trị viên, có toàn quyền cấu hình phòng, quản lý doanh thu, nhân sự và các mã ưu đãi.
  * `STAFF`: Lễ tân, nhân viên vận hành, hỗ trợ đặt hộ tại quầy, làm thủ tục nhận phòng (Check-in), trả phòng (Checkout).
  * `USER`: Khách hàng, có quyền xem danh sách phòng trống, thực hiện đặt phòng trực tuyến, thanh toán và quản lý hồ sơ cá nhân.

### 2. 🛏️ Thuật Toán Trạng Thái Phòng Động (Dynamic Status Resolver)
* **Tối Ưu Database**: Để giảm tải việc đồng bộ trạng thái thủ công, cơ sở dữ liệu chỉ lưu trữ các trạng thái vật lý nền tảng bao gồm `AVAILABLE` (Trống), `CLEANING` (Đang dọn dẹp) và `MAINTENANCE` (Đang bảo trì).
* **Trạng thái hiển thị ảo thời gian thực**: Khi truy vấn, hệ thống tự động phân tích thời gian hiện tại so với các đơn đặt phòng của ngày hôm nay để trả về:
  * `OCCUPIED` (Đang có khách lưu trú).
  * `RESERVED` (Đã có khách đặt và chờ nhận phòng trong ngày hôm nay).
* **Bộ lọc thông minh không trùng lặp**: Ràng buộc truy vấn phức tạp bằng Prisma Transactions giúp bộ lọc quản lý trạng thái phòng Admin hoạt động chính xác 100%, không bị lọt phòng đang có khách ở vào danh mục phòng trống hay dọn dẹp.

### 3. 📅 Luồng Đặt Phòng Đa Năng Chống Trùng Lịch (Race Conditions)
* **Khách hàng đặt trực tuyến (B2C)**: Tự động tạo hồ sơ khách hàng (`Customer`) liên kết trực tiếp với tài khoản người dùng (`userId`), kiểm tra tính khả dụng của phòng trước khi tiến hành thanh toán trực tuyến.
* **Lễ tân đặt hộ tại quầy (B2B/Walk-in)**: Lễ tân chỉ cần nhập **Số điện thoại** của khách. Hệ thống tự động truy vấn tìm kiếm hồ sơ khách hàng cũ để tái sử dụng, hoặc khởi tạo hồ sơ khách mới nếu chưa tồn tại.
  * **Độ chính xác dữ liệu**: Ghi nhận mã nhân viên thực hiện qua trường `createdById`, bảo đảm thông tin tài khoản cá nhân của Admin/Staff không bị ghi đè hoặc bị làm sai lệch.
* **Ràng buộc Transaction chặt chẽ**: Toàn bộ luồng tạo đơn đặt và thanh toán đều chạy trong Prisma Transaction, ngăn chặn tình huống 2 khách đặt trùng một phòng cùng khung giờ.

### 4. 💰 Tích Hợp Cổng Thanh Toán & Mã Giảm Giá
* **Thanh toán Đa Dạng**: Hỗ trợ thanh toán bằng tiền mặt tại quầy (`CASH`) hoặc thanh toán trực tuyến qua cổng **VNPAY / MoMo**.
* **Hệ thống Ưu Đãi (Promotions)**: Quản lý mã giảm giá với đầy đủ điều kiện áp dụng: Giảm theo tỷ lệ phần trăm (%) hoặc giá trị cố định, giới hạn chi tiêu tối thiểu (Min Spend), giới hạn tổng lượt sử dụng toàn hệ thống và lượt sử dụng của mỗi khách hàng.

### 5. ⏰ Tác Vụ Cron Jobs Tự Động Hóa Vận Hành
* **`booking-expiration.job.ts`**: Quét cơ sở dữ liệu liên tục **mỗi 1 phút**, tự động hủy các đơn đặt phòng quá hạn 15 phút chưa thanh toán và giải phóng trạng thái phòng về trống (`AVAILABLE`).
* **`booking-auto-checkout.job.ts`**: Quét **mỗi 5 phút**, tự động Checkout (`CHECKED_OUT`) cho những phòng có khách đã quá hạn thời gian trả phòng thực tế, đồng thời chuyển trạng thái phòng sang dọn dẹp (`CLEANING`) để lễ tân dễ dàng chỉ đạo nhân viên vệ sinh.

---

## 📂 Cấu Trúc Thư Mục Backend (Project Structure)

```text
hotel-booking-api/
├── prisma/                 # Nơi lưu trữ Schema, Cấu hình Migrations & Seed data
│   ├── schema.prisma       # Định nghĩa Database Models và Quan hệ thực thể
│   └── migrations/         # Lịch sử các phiên bản migration PostgreSQL
├── src/
│   ├── api/                # Lớp Routing định nghĩa các API Endpoints
│   │   ├── admin/          # Routes bảo mật dành riêng cho Admin/Staff quản trị
│   │   └── *.route.ts      # Các routes công khai và của Khách hàng (Auth, Booking, Room,...)
│   ├── controllers/        # Tiếp nhận request, kiểm tra đầu vào (express-validator) và gọi Service
│   ├── db/                 # Tầng thao tác trực tiếp với Database (Repository Pattern)
│   │   ├── booking.db.ts   # Xử lý các câu lệnh SQL/Prisma về Đặt phòng phức tạp
│   │   ├── room.db.ts      # Xử lý query trạng thái phòng động, bộ lọc thông minh
│   │   └── ...
│   ├── services/           # Lớp chứa Logic nghiệp vụ (Business Logic) chính của hệ thống
│   ├── middleware/         # Các bộ lọc trung gian (Auth Guard, Error Handler, File Upload,...)
│   ├── jobs/               # Nơi định nghĩa các tác vụ nền tự động (node-cron)
│   ├── config/             # Cấu hình biến môi trường, Minio Client, Mailer
│   ├── utils/              # Các hàm bổ trợ (Mã hóa, định dạng ngày tháng, xuất dữ liệu)
│   ├── constant/           # Khai báo các enum trạng thái hệ thống
│   ├── types/              # Định nghĩa các kiểu dữ liệu và Interface TypeScript
│   ├── templates/          # Các tệp mẫu HTML gửi Email OTP/Hóa đơn
│   ├── app.ts              # Khởi tạo Express App, bảo mật Helmet, CORS, Cookie Parser
│   └── server.ts           # Điểm khởi chạy của Server API
├── dist/                   # File sau khi biên dịch từ TS sang JS (chạy trên Production)
├── .env                    # Biến môi trường local phát triển
└── package.json            # Quản lý script khởi chạy và thư viện dự án
```

---

## 🛠️ Công Nghệ & Các Thư Viện Chính

| Thư viện | Phiên bản | Vai trò trong hệ thống |
| :--- | :--- | :--- |
| **`express`** | `5.2.1` | Web Framework tốc độ cao, hỗ trợ Router phân tầng mạch lạc. |
| **`prisma`** / **`@prisma/client`** | `6.10.1` | ORM thế hệ mới tự động ánh xạ kiểu dữ liệu TypeScript với SQL. |
| **`postgresql`** | `14.x+` | Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đảm bảo tính toàn vẹn (ACID). |
| **`jsonwebtoken`** / **`bcryptjs`** | `9.x / 3.x` | Mã hóa mật khẩu một chiều cực mạnh và cấp phát token bảo mật JWT. |
| **`node-cron`** | `4.2.1` | Bộ lập lịch tự động kích hoạt các Cron Jobs xử lý trạng thái. |
| **`nodemailer`** / **`resend`** | `7.x / 3.5` | Dịch vụ gửi mail OTP, thông tin hóa đơn HTML định dạng chuyên nghiệp. |
| **`minio`** | `8.0.7` | Kết nối và lưu trữ ảnh phòng, ảnh hồ sơ lên dịch vụ Object Storage S3. |
| **`winston`** / **`morgan`** | `3.x / 1.x` | Log hệ thống chuẩn hóa, hỗ trợ ghi file log lỗi và giám sát API truy cập. |

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### 1. Cài đặt các gói phụ thuộc
Cài đặt toàn bộ các thư viện TypeScript và Backend:
```bash
npm install
```

### 2. Thiết lập Biến Môi Trường (.env)
Tạo tệp `.env` ở thư mục gốc và cung cấp thông tin kết nối PostgreSQL cùng các cấu hình khác (Tham khảo `.env.example`):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/hotel_booking?schema=public"
JWT_SECRET="your_secure_jwt_secret_key"

# Cấu hình SMTP gửi mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cấu hình Minio/S3 Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_secret_password
MINIO_BUCKET=hotel-booking
```

### 3. Đồng bộ hóa Cơ sở dữ liệu (Database Migration)
Áp dụng các cấu hình Schema có sẵn của Prisma vào PostgreSQL:
```bash
npx prisma migrate dev
```

*(Optional) Khởi tạo dữ liệu mẫu (Seed Data) nếu cần thiết:*
```bash
npx prisma db seed
```

### 4. Khởi chạy Server
* **Chạy môi trường phát triển (Local Development)**:
  ```bash
  npm run dev
  ```
  *(Server sẽ tự động reload mỗi khi bạn thay đổi code)*

* **Mở trình quản lý Prisma Studio (Giao diện trực quan)**:
  ```bash
  npm run prisma:studio
  ```

* **Xây dựng và chạy môi trường Production**:
  ```bash
  npm run build
  npm start
  ```

---

## 🔒 Quy chuẩn Bảo Mật & Best Practices của Backend
* **Strict Type Safety**: Mọi Controller, Service và Repository đều định nghĩa kiểu dữ liệu nghiêm ngặt.
* **Transaction Safe**: Sử dụng Prisma transaction cho các tác vụ quan trọng như thanh toán, cập nhật trạng thái phòng, đặt phòng để ngăn ngừa deadlock và sai lệch dữ liệu.
* **Input Sanitization**: Mọi API đầu vào đều đi qua lớp middleware xác thực cấu trúc `express-validator` để loại bỏ các dữ liệu rác, phòng chống tấn công SQL Injection và XSS.
* **Graceful Shutdown**: Hệ thống bắt và xử lý triệt để các tín hiệu dừng Server để đóng kết nối Database an toàn, không làm hỏng các Transaction đang chạy dở.

Chúc các bạn phát triển dự án thành công và đạt hiệu quả vận hành tối đa! 🚀🏨