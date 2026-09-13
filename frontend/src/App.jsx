import { Route, Routes } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute/protectedRoute';
import NotFoundPage from './pages/NotFound/NotFoundPage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<div style={{ color: 'white' }}>Nội dung trang web</div>} />
          {/* <Route path="/classes" element={<ClassList />} /> */}
          {/* <Route path="/classes/:classId" element={<ClassDetail />} /> */}
          {/* <Route path="/classes/:classId/sessions/:sessionId" element={<SessionDetail />} /> */}
          {/* <Route path="/classes/:classId/sessions/:sessionId/camera" element={<SessionCameraPage />} /> */}
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
