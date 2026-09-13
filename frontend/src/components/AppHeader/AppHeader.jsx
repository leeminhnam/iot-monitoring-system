import { BellOutlined, UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import './AppHeader.css';

const AppHeader = ({ title = 'Giá trị cảm biến' }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const displayName = user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : (loading ? 'Đang tải...' : 'Khách');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const items = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Tài khoản',
      onClick: () => navigate('/account')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="header-greeting">
          <span className="greeting-text">XIN CHÀO,</span>
          <span className="user-name">{displayName}</span>
        </div>

        <div className="header-actions">
          <button className="notification-btn">
            <BellOutlined />
          </button>

          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <div className="user-avatar">
              <UserOutlined />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
