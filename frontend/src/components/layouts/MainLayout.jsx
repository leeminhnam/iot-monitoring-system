import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from '../AppHeader/AppHeader';
import AppSidebar from '../AppSidebar/AppSidebar';

function MainLayout() {
  const location = useLocation();

  let title = "Hệ thống IoT";
  if (location.pathname === '/account') title = "Tài khoản";
  else if (location.pathname === '/sensors') title = "Giá trị cảm biến";
  else if (location.pathname === '/overview') title = "Tổng quan";
  else if (location.pathname === '/history') title = "Lịch sử thiết bị";

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#101322', overflow: 'hidden' }}>
      <AppSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppHeader title={title} />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
