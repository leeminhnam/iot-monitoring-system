import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  CompassOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ApiOutlined
} from '@ant-design/icons';
import './AppSidebar.css';

const AppSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: 'overview', path: '/', label: 'Tổng quan', icon: <AppstoreOutlined /> },
    { id: 'sensors', path: '/sensors', label: 'Cảm biến', icon: <CompassOutlined /> },
    { id: 'history', path: '/history', label: 'Lịch sử thiết bị', icon: <ClockCircleOutlined /> },
    { id: 'account', path: '/account', label: 'Tài khoản', icon: <UserOutlined /> },
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
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              to={item.path}
              key={item.id}
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Phiên bản Desktop v1.0</p>
        <p>PTIT @ 2026</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
