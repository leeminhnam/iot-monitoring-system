import { Route, Routes } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute/protectedRoute';
import NotFoundPage from './pages/NotFound/NotFoundPage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import MainLayout from './components/layouts/MainLayout';
import AccountPage from './pages/Account/AccountPage.jsx';
import SensorHistory from './pages/SensorHistory/SensorHistory.jsx';
import ActionHistory from './pages/ActionHistory/ActionHistory.jsx';

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<div style={{ color: 'white' }}>Nội dung trang web</div>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sensors" element={<SensorHistory />} />
          <Route path="/history" element={<ActionHistory />} />
        </Route>

        <Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
