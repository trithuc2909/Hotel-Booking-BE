# 🏨 Hotel Management API

API quản lý khách sạn với Node.js, Express, TypeScript và Prisma.

## ✨ Tính năng

- 🔐 Xác thực và phân quyền (JWT)
- 🏨 Quản lý phòng và loại phòng
- 👥 Quản lý khách hàng
- 📅 Quản lý đặt phòng
- 💰 Quản lý thanh toán
- 🛎️ Quản lý dịch vụ

## 📋 Yêu cầu

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm

## ⚙️ Cài đặt

### 1. Clone repository
```bash
1. git clone <repository-url>
2. cd Hotel-Booking-BE
3. Copy `.env.example` thành [.env](cci:7://file:///d:/Hotel-Booking-BE/.env:0:0-0:0) và điền thông tin database
4. Chạy migrations: `npx prisma migrate dev`
5. Chạy server: `npm run dev`

📚 Scripts
- npm run dev - Chạy local development
- npm run dev:server - Chạy dev server
- npm run start:prod - Build và chạy production
- npm run prisma:studio - Mở Prisma Studio
- npm run prisma:migrate - Tạo migration

## 🛠️ Tech Stack
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Winston (Logging)