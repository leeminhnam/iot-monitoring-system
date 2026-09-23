import React from 'react';
import { Button } from 'antd';
import {
  GithubOutlined,
  FormatPainterOutlined,
  SendOutlined,
  BookOutlined
} from '@ant-design/icons';
import './AccountPage.css';

export default function AccountPage() {
  const defaultUser = {
    fullName: 'Lê Minh Nam',
    studentId: 'B23DCCN579',
    className: 'INT14149-20261-11',
    school: 'Học viện Công nghệ Bưu chính Viễn thông',
  };

  const displayUser = {
    fullName: defaultUser.fullName,
    studentId: defaultUser.studentId,
    className:defaultUser.className,
    school: defaultUser.school,
  };

  if (!displayUser.fullName) {
    displayUser.fullName = defaultUser.fullName;
  }

  return (
    <div className="account-container">
      <div className="account-col-left">
        <div className="account-card avatar-card">
          <div className="avatar-circle">
            <img src="/avatar.jpg" alt="Avatar" className="avatar-img" />
          </div>
          <h2 className="avatar-name">{displayUser.fullName}</h2>
          <p className="avatar-school">{displayUser.school}</p>
        </div>

        <div className="info-box">
          <span className="info-label">HỌ VÀ TÊN</span>
          <span className="info-value">{displayUser.fullName}</span>
        </div>

        <div className="info-box">
          <span className="info-label">MÃ SINH VIÊN</span>
          <span className="info-value">{displayUser.studentId}</span>
        </div>

        <div className="info-box">
          <span className="info-label">LỚP</span>
          <span className="info-value">{displayUser.className}</span>
        </div>
      </div>

      <div className="account-col-right">
        <div className="account-card links-card">
          <h3 className="links-title">Liên kết dự án & Tài liệu</h3>

          <div className="links-list">
            <Button
              type="text"
              className="link-item"
              href="https://github.com/leeminhnam/iot-monitoring-system"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="link-icon-wrapper">
                <GithubOutlined />
              </div>
              <div className="link-text">
                <span className="link-name">GitHub Repository</span>
                <span className="link-url">leeminhnam/iot-monitoring-system</span>
              </div>
            </Button>

            <Button
              type="text"
              className="link-item"
              href="https://www.figma.com/design/RWWbEoOyNutxmsuOjG8KZ0/IoT-Device-Monitoring-Dashboard?node-id=1559-412&p=f&t=cmB8tENHGflmpjCJ-0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="link-icon-wrapper">
                <FormatPainterOutlined />
              </div>
              <div className="link-text">
                <span className="link-name">Figma Design Mockup</span>
                <span className="link-url">figma.com - IoT Device Monitoring Dashboard</span>
              </div>
            </Button>

            <Button
              type="text"
              className="link-item"
              href="https://solar-flare-6446.postman.co/workspace/L%C3%AA-Minh-Nam's-Workspace~1167b716-db01-43e1-8e11-a352395bf5de/collection/58276532-f04bfa21-699d-46e7-84be-aad025aae099?action=share&creator=58276532"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="link-icon-wrapper">
                <SendOutlined />
              </div>
              <div className="link-text">
                <span className="link-name">Postman API Docs</span>
                <span className="link-url">postman.com - IoT Monitoring API Collection</span>
              </div>
            </Button>

            <Button
              type="text"
              className="link-item"
              href="/iot-report-2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="link-icon-wrapper">
                <BookOutlined />
              </div>
              <div className="link-text">
                <span className="link-name">Báo cáo tiểu luận PDF</span>
                <span className="link-url">iot-report-2026.pdf</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
