import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { message } from 'antd';
import loginApi from '../../services/loginApi';
import './LoginPage.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginApi.login(formData);

      const token = response.data?.token || response.token;

      if (token) {
        localStorage.setItem('token', token);
        message.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        message.error('Đăng nhập thất bại, không nhận được token!');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    message.info('Tính năng quên mật khẩu đang được phát triển!');
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="logo-container">
          <ApiOutlined className="logo-icon" style={{ fontSize: '28px', color: '#00f2fe' }} />
        </div>

        <h1 className="title">Hệ thống IoT</h1>
        <p className="subtitle">Giám sát & Điều khiển thiết bị thông minh</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOutlined style={{ fontSize: '18px', color: '#00e5ff' }} />
                ) : (
                  <EyeInvisibleOutlined style={{ fontSize: '18px' }} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <div className="forgot-password">
            <a
              href="#forgot-password"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Quên mật khẩu?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
