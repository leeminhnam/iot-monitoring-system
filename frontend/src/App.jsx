import { Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute/protectedRoute';
import NotFoundPage from './pages/NotFound/NotFoundPage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
        <div className="app-container">
          <Routes>
            <Route>
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
      </Content>
    </Layout>
  );
};

export default App;
