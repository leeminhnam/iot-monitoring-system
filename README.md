# IOT MONITORING SYSTEM

Hệ thống IoT giám sát các chỉ số môi trường (Nhiệt độ, Độ ẩm, Cường độ ánh sáng) và điều khiển thiết bị điện từ xa theo thời gian thực (Real-time).

---

## Công nghệ sử dụng

* Frontend: ReactJS + Ant Design + Socket.io-client + Recharts / Chart.js
* Backend: Node.js + Express + MongoDB(Mongoose) + Socket.io
* Truyền thông: MQTT Protocol (HiveMQ / Mosquitto Broker) + WebSocket
* Firmware: C/C++ (Arduino IDE / ESP8266 NodeMCU)

---

## Kiến trúc hệ thống

Hệ thống được chia thành 3 thành phần chính:

- Frontend: Giao diện Dashboard hiển thị thông số cảm biến, đồ thị thời gian thực, bảng lịch sử và công tắc điều khiển thiết bị.
- Backend: Xử lý RESTful API, xác thực người dùng (JWT), điều phối dữ liệu WebSocket thời gian thực và đóng vai trò MQTT Client giao tiếp với phần cứng.
- Firmware (ESP8266): Thu thập dữ liệu từ cảm biến DHT11, LM393 gửi lên MQTT Broker và nhận lệnh điều khiển để bật/tắt thiết bị (đèn LED/Relay).

---

## Cấu trúc dự án

```
iot-monitoring-system/
│── frontend/        # React UI
│── backend/         # NodeJS API + MongoDB + Socket.io + MQTT Client
│── firmware/        # Mã nguồn nạp cho vi điều khiển ESP8266
│── package.json     # Chạy FE + BE cùng lúc (dùng concurrently)
│── README.md
```

---

## Clone project

```bash
git https://github.com/leeminhnam/iot-monitoring-system.git
cd /iot-monitoring-system
```

---

## Yêu cầu hệ thống

* Node.js >= 18 (đã test với Node.js 22)
* MongoDB: Bản cài đặt cục bộ (cổng mặc định 27017) hoặc MongoDB Atlas Cloud
* Trình quản lý gói: npm

---

## Cài đặt & chạy hệ thống

---

## 1. Cài đặt toàn bộ (Frontend + Backend)

### Bước 1: Cài dependencies ở thư mục gốc
```bash
npm install
```

### Bước 2: Cấu hình Backend (.env)

Tạo file `.env` trong thư mục `backend`:

```env

DB_URL=<MongoDB Connection String>

secretKey=<JWT Secret>

R2_ACCESS_KEY_ID=<Access Key>
R2_SECRET_ACCESS_KEY=<Secret Key>
R2_BUCKET_NAME=<Bucket Name>
R2_ENDPOINT=<Endpoint>
R2_PUBLIC_URL=<Public URL>

```

* Chú ý: Nếu không cấu hình .env, backend sẽ không thể chạy như mong đợi.

---

## 2. Chạy Frontend + Backend cùng lúc

### Quan trọng: Chạy lệnh này tại thư mục gốc (iot-monitoring-system)
```bash
npm run dev
```

Sau khi chạy thành công:

* Frontend: http://localhost:5173
* Backend: http://localhost:3001

---