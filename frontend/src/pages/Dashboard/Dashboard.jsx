import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Typography, message, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FireOutlined, CloudOutlined, BulbOutlined } from '@ant-design/icons';
import { io } from 'socket.io-client';
import sensorApi from '../../services/sensorApi';
import deviceApi from '../../services/deviceApi';

import './Dashboard.css';

const { Title, Text } = Typography;

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

      await Promise.all([fetchChart(), fetchDevices()]);
      setLoading(false);
    };

    fetchDashboardData();

    const socket = io('http://localhost:8080');

    socket.on('sensor_update', (data) => {
      setCurrentData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        light: data.light || 0
      });

      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }), // HH:mm giờ VN
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
        const deviceName = device.name || 'Thiết bị';
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
          message.error(`Không nhận được phản hồi từ ${deviceName} sau 5 giây`);
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
              <Text style={{color: '#8c8c8c'}}>Nhiệt độ</Text>
              <FireOutlined className="icon-temp" />
            </div>
            <div className="stat-value">
              <span className="value temp">{currentData.temperature}</span>
              <span className="unit">°C</span>
            </div>
            <div className="stat-footer">
              <div className="indicator dot-temp"></div>
              <Text style={{color: '#8c8c8c', marginLeft: 8}}>Bình thường</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-title">
              <Text style={{color: '#8c8c8c'}}>Độ ẩm</Text>
              <CloudOutlined className="icon-humid" />
            </div>
            <div className="stat-value">
              <span className="value humid">{currentData.humidity}</span>
              <span className="unit">%</span>
            </div>
            <div className="stat-footer">
              <div className="indicator dot-humid"></div>
              <Text style={{color: '#8c8c8c', marginLeft: 8}}>Dịu nhẹ</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-title">
              <Text style={{color: '#8c8c8c'}}>Ánh sáng</Text>
              <BulbOutlined className="icon-light" />
            </div>
            <div className="stat-value">
              <span className="value light">{currentData.light}</span>
              <span className="unit">lux</span>
            </div>
            <div className="stat-footer">
              <div className="indicator dot-light"></div>
              <Text style={{color: '#8c8c8c', marginLeft: 8}}>Đủ sáng</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="main-content-row">
        <Col span={16}>
          <Card
            className="chart-card"
            bordered={false}
            title={<Text style={{color: '#fff', fontSize: '16px'}}>Đồ thị cảm biến (Thời gian thực)</Text>}
          >
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2e3e" vertical={false} />
                  <XAxis dataKey="time" stroke="#8c8c8c" tick={{fill: '#8c8c8c', fontSize: 12}} />
                  <YAxis stroke="#8c8c8c" tick={{fill: '#8c8c8c', fontSize: 12}} />
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

        {/* Hệ thống Đèn */}
        <Col span={8}>
          <Card
            className="device-card"
            bordered={false}
            title={<Text style={{color: '#fff', fontSize: '16px'}}>Hệ thống Đèn</Text>}
          >
            <div className="device-list">
              {devices.length === 0 ? (
                [1, 2, 3].map(i => (
                  <div className="device-item" key={i}>
                    <div className="device-info">
                      <Text style={{color: '#fff', fontSize: '15px'}}>Đèn {i}</Text>
                      <Text style={{color: '#8c8c8c', fontSize: '12px', display: 'block'}}>Đang tắt</Text>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                ))
              ) : (
                devices.map((device, index) => (
                  <div className="device-item" key={device._id}>
                    <div className="device-info">
                      <Text style={{color: '#fff', fontSize: '15px'}}>{device.name || `Đèn ${index + 1}`}</Text>
                      <Text style={{color: '#8c8c8c', fontSize: '12px', display: 'block'}}>
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