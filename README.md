# IOT MONITORING SYSTEM

## 1. Giới thiệu về hệ thống

Hệ thống IoT giám sát các chỉ số môi trường (Nhiệt độ, Độ ẩm, Cường độ ánh sáng) và điều khiển thiết bị điện từ xa theo thời gian thực (Real-time).

**Công nghệ sử dụng:**
- **Frontend:** ReactJS + Ant Design + Socket.io-client + Recharts / Chart.js
- **Backend:** Node.js + Express + MongoDB (Mongoose) + Socket.io
- **Truyền thông:** MQTT Protocol (Mosquitto / HiveMQ Broker) + WebSocket
- **Firmware:** C/C++ (Arduino IDE / ESP8266 NodeMCU)

**Kiến trúc hệ thống:**
- **Frontend:** Giao diện Dashboard hiển thị thông số cảm biến, đồ thị thời gian thực, bảng lịch sử và công tắc điều khiển thiết bị.
- **Backend:** Xử lý RESTful API, xác thực người dùng (JWT), điều phối dữ liệu WebSocket thời gian thực và đóng vai trò MQTT Client giao tiếp với phần cứng.
- **Firmware (ESP8266):** Thu thập dữ liệu từ cảm biến (DHT11, quang trở, v.v.), gửi lên MQTT Broker và nhận lệnh điều khiển để bật/tắt thiết bị (đèn LED/Relay).

---

## 2. Cấu trúc thư mục

```text
iot-monitoring-system/
│── frontend/                          # React UI (Giao diện người dùng)
│   │── public/                        # Tài nguyên tĩnh (static assets)
│   │── src/                           # Mã nguồn chính của React
│   │   │── assets/                    # Hình ảnh & tài nguyên
│   │   │── components/                # Các component tái sử dụng
│   │   │── hooks/                     # Custom React Hooks
│   │   │── pages/                     # Các trang của ứng dụng
│   │   │── services/                  # Các API service (gọi Backend)
│   │   │── utils/                     # Hàm tiện ích
│   │   │── styles/                    # Thư mục style chung
│   │   │── App.jsx                    # Component gốc, cấu hình Router
│   │   │── main.jsx                   # Entry point (ReactDOM.render)
│   │   └── index.css                  # Style global (reset, font,...)
│   │── index.html                     # File HTML gốc (Vite entry)
│   │── package.json                   # Dependencies & scripts frontend
│   │── package-lock.json              # Lock file dependencies
│   │── vite.config.js                 # Cấu hình Vite (proxy, port,...)
│   │── eslint.config.js               # Cấu hình ESLint
│   └── .gitignore                     # Danh sách file/folder bỏ qua bởi Git
│── backend/                           # NodeJS API + MongoDB + Socket.io + MQTT Client
│   │── controllers/                   # Xử lý logic request/response
│   │── models/                        # Mongoose Schema (cấu trúc dữ liệu MongoDB)
│   │── routes/                        # Định nghĩa API endpoints
│   │── services/                      # Business logic & tích hợp bên ngoài
│   │── middlewares/                   # Middleware xử lý trung gian
│   │── utils/                         # Hàm tiện ích dùng chung
│   │── scripts/                       # Script tiện ích
│   │── server.js                      # Entry point backend (khởi tạo Express, MongoDB, MQTT, Socket.io)
│   │── package.json                   # Dependencies & scripts backend
│   │── package-lock.json              # Lock file dependencies
│   └── .env                           # Biến môi trường (DB_URL, JWT secret, MQTT config)
│── firmware/                          # Mã nguồn nạp cho vi điều khiển ESP8266
│   └── esp8266_firmware/              # Thư mục project firmware
│── package.json                       # Chứa script khởi chạy FE + BE cùng lúc
│── README.md                          # Tài liệu hướng dẫn dự án
```

---

## 3. Cách clone dự án

Để tải dự án về máy, bạn mở terminal (hoặc Git Bash/Command Prompt) và chạy lệnh sau:

```bash
git clone https://github.com/leeminhnam/iot-monitoring-system.git
cd iot-monitoring-system
```

---

## 4. Các trường cần thiết trong file `.env` của backend

Trước khi khởi chạy hệ thống, bạn cần cấu hình các biến môi trường cho Backend. Tạo một file `.env` nằm trong thư mục `backend` (`backend/.env`) và cung cấp các thông số sau:

```env
# URL kết nối đến cơ sở dữ liệu MongoDB (cục bộ hoặc MongoDB Atlas)
DB_URL=your_db_url

# Khóa bí mật dùng để mã hóa và xác thực JWT token
secretKey=your_secret_key_here

# Cấu hình kết nối đến MQTT Broker (ví dụ: Mosquitto)
MQTT_SERVER=mqtt://localhost:1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

*(Lưu ý: Nếu không cấu hình đúng các trường trong file `.env`, backend sẽ báo lỗi kết nối và không thể hoạt động như mong đợi.)*

---

## 5. Cài đặt và chạy hệ thống

**Yêu cầu hệ thống:**
- Node.js >= 18
- MongoDB: Đã cài đặt cục bộ (cổng mặc định 27017) hoặc sử dụng MongoDB Atlas Cloud
- Trình quản lý gói: npm
- MQTT Broker (như Mosquitto) đang hoạt động ở cổng 1883

**Bước 1: Cài đặt dependencies**
Tại thư mục gốc của dự án (`iot-monitoring-system`), chạy lệnh sau để tự động cài đặt tất cả thư viện cần thiết cho cả frontend và backend:
```bash
npm install
```

**Bước 2: Khởi tạo dữ liệu ban đầu (chỉ cần chạy một lần)**
Script `resetDatabase.js` sẽ xóa toàn bộ dữ liệu cũ và tạo lại dữ liệu mặc định bao gồm: danh sách thiết bị (Led 1, Led 2, Led 3), danh sách cảm biến (DHT11, BH1750) và tài khoản đăng nhập mặc định.
```bash
cd backend
node scripts/resetDatabase.js
cd ..
```

> **Tài khoản đăng nhập mặc định:**
> - **Username:** `B23DCCN579`
> - **Password:** `12345678`

*(Lưu ý: Mỗi lần chạy lại script này sẽ **xóa toàn bộ** dữ liệu hiện có trong database và khôi phục về trạng thái ban đầu. Chỉ nên chạy khi thiết lập lần đầu hoặc muốn reset dữ liệu.)*

**Bước 3: Chạy đồng thời Frontend và Backend**
Vẫn ở thư mục gốc của dự án, dùng lệnh sau:
```bash
npm run dev
```

**Truy cập ứng dụng:**
Sau khi terminal hiển thị thông báo chạy thành công:
- **Frontend (Giao diện UI):** http://localhost:5173
- **Backend (API Server):** http://localhost:3001

---

## 6. Hướng dẫn nạp code cho NodeMCU (ESP8266)

Để chạy được phần cứng gửi dữ liệu lên hệ thống, bạn cần nạp code (firmware) cho mạch NodeMCU ESP8266.

**Bước 1: Cài đặt Arduino IDE và Board ESP8266**
1. Tải và cài đặt [Arduino IDE](https://www.arduino.cc/en/software).
2. Mở Arduino IDE, vào **File -> Preferences**. Ở mục **Additional Boards Manager URLs**, thêm đường dẫn sau:
   `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
3. Vào **Tools -> Board -> Boards Manager**, tìm kiếm từ khóa `esp8266` và bấm **Install**.

**Bước 2: Cài đặt thư viện**
Vào **Sketch -> Include Library -> Manage Libraries** và cài đặt các thư viện sau:
- **PubSubClient** (bởi Nick O'Leary) - Dùng để kết nối MQTT.
- **DHT sensor library** (bởi Adafruit) - Đọc dữ liệu cảm biến DHT.
- **Adafruit Unified Sensor** - Thư viện nền tảng bắt buộc của Adafruit.

**Bước 3: Mở project và cấu hình mạng**
1. Dùng Arduino IDE mở file `firmware/esp8266_firmware/ESP8266_Project.ino/ESP8266_Project/ESP8266_Project.ino`.
2. Chỉnh sửa thông số Wi-Fi và MQTT trong file `ESP8266_Project.ino` cho đúng với mạng của bạn:
   ```cpp
   // Cấu hình Wi-Fi
   const char* WIFI_SSID = "TEN_WIFI_CUA_BAN";
   const char* WIFI_PASSWORD = "MAT_KHAU_WIFI";
   
   // Cấu hình MQTT (Thay bằng IP LAN của máy tính chạy Backend / MQTT Broker)
   const char* MQTT_SERVER = "192.168.x.x"; 
   const int MQTT_PORT = 1883;
   ```

**Bước 4: Biên dịch và nạp code**
1. Kết nối mạch NodeMCU vào máy tính qua cáp USB.
2. Vào **Tools -> Board**, chọn **NodeMCU 1.0 (ESP-12E Module)**.
3. Vào **Tools -> Port**, chọn cổng COM tương ứng với mạch (ví dụ COM3, COM4).
4. Bấm nút **Upload** (mũi tên hướng sang phải) và chờ đến khi nạp xong (báo `Done uploading`).
5. Bạn có thể mở **Serial Monitor** (biểu tượng kính lúp góc phải) với baudrate `115200` để xem log quá trình mạch kết nối Wi-Fi và MQTT.
