import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Typography, message, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FireOutlined, CloudOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { io } from 'socket.io-client';
import sensorApi from '../../services/sensorApi';
import deviceApi from '../../services/deviceApi';

import './Dashboard.css';

const { Title, Text } = Typography;

const getTemperatureStatus = (value) => {
  if (value <= 0) return { label: 'Rất lạnh', color: '#00bcd4' };
  if (value <= 15) return { label: 'Lạnh', color: '#29b6f6' };
  if (value <= 25) return { label: 'Bình thường', color: '#66bb6a' };
  if (value <= 35) return { label: 'Nóng', color: '#ff9f43' };
  return { label: 'Rất nóng', color: '#f44336' };
};

const getHumidityStatus = (value) => {
  if (value <= 20) return { label: 'Rất khô', color: '#f44336' };
  if (value <= 40) return { label: 'Khô', color: '#ff9f43' };
  if (value <= 70) return { label: 'Dịu nhẹ', color: '#66bb6a' };
  if (value <= 85) return { label: 'Ẩm', color: '#29b6f6' };
  return { label: 'Rất ẩm', color: '#00bcd4' };
};

const getLightStatus = (value) => {
  if (value <= 50) return { label: 'Rất tối', color: '#9e9e9e' };
  if (value <= 200) return { label: 'Tối', color: '#ff9f43' };
  if (value <= 500) return { label: 'Đủ sáng', color: '#66bb6a' };
  if (value <= 800) return { label: 'Sáng', color: '#ffd700' };
  return { label: 'Rất sáng', color: '#ffeb3b' };
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0
  });

  const [chartData, setChartData] = useState([]);
  const [devices, setDevices] = useState([]);
  const devicesRef = React.useRef(devices);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const fetchChart = async () => {
        try {
          const res = await sensorApi.getChartData({ limit: 50 });
          setChartData(res.data);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu biểu đồ:", err);
        }
      };

      const fetchDevices = async () => {
        try {
          const res = await deviceApi.getDevices();
          setDevices(res.data);
        } catch (err) {
          console.error("Lỗi khi lấy danh sách thiết bị:", err);
        }
      };

        const fetchLatestSensor = async () => {
        try {
          const res = await sensorApi.getLatestSensorData();
          const arr = res.data;
          const parsed = { temperature: 0, humidity: 0, light: 0 };
          arr.forEach(item => {
            if (item.sensorType === 'temperature') parsed.temperature = item.value;
            else if (item.sensorType === 'humidity') parsed.humidity = item.value;
            else if (item.sensorType === 'light') parsed.light = item.value;
          });
          setCurrentData(parsed);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu cảm biến mới nhất:", err);
        }
      };

      await Promise.all([fetchChart(), fetchDevices(), fetchLatestSensor()]);
      setLoading(false);
    };

    fetchDashboardData();

    const socket = io('http://localhost:3001');

    let fallbackInterval = null;

    const startFallback = () => {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(async () => {
        try {
          const res = await sensorApi.getLatestSensorData();
          const arr = res.data;
          const parsed = { temperature: 0, humidity: 0, light: 0 };
          arr.forEach(item => {
            if (item.sensorType === 'temperature') parsed.temperature = item.value;
            else if (item.sensorType === 'humidity') parsed.humidity = item.value;
            else if (item.sensorType === 'light') parsed.light = item.value;
          });
          setCurrentData(parsed);
        } catch (err) {
          console.error("Lỗi fallback lấy dữ liệu cảm biến:", err);
        }
      }, 10000);
    };

    const stopFallback = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    socket.on('connect_error', () => {
      startFallback();
    });

    socket.on('disconnect', () => {
      startFallback();
    });

    socket.on('connect', () => {
      stopFallback();
    });

    socket.on('sensor_update', (data) => {
      stopFallback();
      setCurrentData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        light: data.light || 0
      });

      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          temperature: data.temperature,
          humidity: data.humidity,
          light: data.light
        }];
        if (newData.length > 50) return newData.slice(newData.length - 50);
        return newData;
      });
    });

    socket.on('device_update', (data) => {
      const currentDevices = devicesRef.current;
      const device = currentDevices.find(d => d._id === data._id);

      if (device?.loading) {
        const deviceName = device.name || 'thiết bị';
        if (data.status === 'on') {
          message.success(`Bật ${deviceName} thành công`);
        } else {
          message.success(`Tắt ${deviceName} thành công`);
        }
      }

      setDevices(prev => prev.map(d =>
        d._id === data._id ? { ...d, status: data.status, loading: false } : d
      ));
    });

    return () => {
      stopFallback();
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('sensor_update');
      socket.off('device_update');
    };
  }, []);

  const toggleDevice = async (deviceId, checked) => {
    setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, loading: true } : d));

    const action = checked ? "turn_on" : "turn_off";

    try {
      await deviceApi.toggleDevice(deviceId, action);

      setTimeout(() => {
        const currentDevices = devicesRef.current;
        const targetDevice = currentDevices.find(d => d._id === deviceId);

        if (targetDevice && targetDevice.loading) {
          const deviceName = targetDevice.name || 'Thiết bị';
          message.error(`Không nhận được phản hồi từ ${deviceName}`);
          setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, loading: false } : d));
        }
      }, 5000);
    } catch (err) {
      console.error("Lỗi khi điều khiển thiết bị:", err);
      message.error("Điều khiển thiết bị thất bại");
      setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, loading: false } : d));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Row gutter={16} className="stats-row">
        <Col span={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-title">
              <Text style={{ color: '#8c8c8c' }}>Nhiệt độ</Text>
              <FireOutlined className="icon-temp" />
            </div>
            <div className="stat-value">
              <span className="value temp">{currentData.temperature}</span>
              <span className="unit">°C</span>
            </div>
            <div className="stat-footer">
              <div className="indicator" style={{ backgroundColor: getTemperatureStatus(currentData.temperature).color }}></div>
              <Text style={{ color: '#8c8c8c', marginLeft: 8 }}>{getTemperatureStatus(currentData.temperature).label}</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-title">
              <Text style={{ color: '#8c8c8c' }}>Độ ẩm</Text>
              <CloudOutlined className="icon-humid" />
            </div>
            <div className="stat-value">
              <span className="value humid">{currentData.humidity}</span>
              <span className="unit">%</span>
            </div>
            <div className="stat-footer">
              <div className="indicator" style={{ backgroundColor: getHumidityStatus(currentData.humidity).color }}></div>
              <Text style={{ color: '#8c8c8c', marginLeft: 8 }}>{getHumidityStatus(currentData.humidity).label}</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-title">
              <Text style={{ color: '#8c8c8c' }}>Ánh sáng</Text>
              <BulbOutlined className="icon-light" />
            </div>
            <div className="stat-value">
              <span className="value light">{currentData.light}</span>
              <span className="unit">lux</span>
            </div>
            <div className="stat-footer">
              <div className="indicator" style={{ backgroundColor: getLightStatus(currentData.light).color }}></div>
              <Text style={{ color: '#8c8c8c', marginLeft: 8 }}>{getLightStatus(currentData.light).label}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="main-content-row">
        <Col span={16}>
          <Card
            className="chart-card"
            bordered={false}
            title={<Text style={{ color: '#fff', fontSize: '16px' }}>Đồ thị cảm biến (Thời gian thực)</Text>}
          >
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2e3e" vertical={false} />
                  <XAxis dataKey="time" stroke="#8c8c8c" tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                  <YAxis stroke="#8c8c8c" tick={{ fill: '#8c8c8c', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e2130', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" name="Nhiệt độ (°C)" dataKey="temperature" stroke="#ff9f43" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="Độ ẩm (%)" dataKey="humidity" stroke="#00e5ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="Ánh sáng (lx)" dataKey="light" stroke="#ffd700" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            className="device-card"
            bordered={false}
            title={<Text style={{ color: '#fff', fontSize: '16px' }}>Hệ thống đèn</Text>}
          >
            <div className="device-list">
              {devices.length === 0 ? (
                [1, 2, 3].map(i => (
                  <div className="device-item" key={i}>
                    <div className="device-info">
                      <Text style={{ color: '#fff', fontSize: '15px' }}>Đèn {i}</Text>
                      <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>Đang tắt</Text>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                ))
              ) : (
                devices.map((device, index) => (
                  <div className="device-item" key={device._id}>
                    <div className="device-info">
                      <Text style={{ color: '#fff', fontSize: '15px' }}>
                        {device.name || `Đèn ${index + 1}`}
                        {device.status === 'on' && (
                          <BulbFilled style={{ color: '#ffd700', marginLeft: 8, fontSize: '14px' }} />
                        )}
                      </Text>
                      <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block' }}>
                        {device.status === 'on' ? 'Đang bật' : 'Đang tắt'}
                      </Text>
                    </div>
                    <Switch
                      checked={device.status === 'on'}
                      onChange={(checked) => toggleDevice(device._id, checked)}
                      loading={device.loading}
                      className={device.status === 'on' ? 'switch-on' : ''}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;