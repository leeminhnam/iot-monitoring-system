import React from 'react';
import {
  AppstoreOutlined,
  CompassOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ApiOutlined
} from '@ant-design/icons';
import './AppSidebar.css';

const AppSidebar = () => {
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: <AppstoreOutlined />, active: false },
    { id: 'sensors', label: 'Cảm biến', icon: <CompassOutlined />, active: true },
    { id: 'history', label: 'Lịch sử thiết bị', icon: <ClockCircleOutlined />, active: false },
    { id: 'account', label: 'Tài khoản', icon: <UserOutlined />, active: false },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <ApiOutlined />
        </div>
        <div className="logo-text">
          <h2>Hệ thống IoT</h2>
          <span>IoT Lab</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <a
            href={`/${item.id}`}
            key={item.id}
            className={`menu-item ${item.active ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Phiên bản Desktop v1.0</p>
        <p>PTIT @ 2026</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
