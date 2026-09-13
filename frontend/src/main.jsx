import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00e5ff',
          colorBgBase: '#101322',
          colorBgContainer: '#1a1c29',
          colorBgElevated: '#1e253c', // Màu nền cho dropdown
          colorBorderSecondary: '#2d3748', // Màu divider của dropdown
        },
        components: {
          Dropdown: {
            controlItemBgHover: 'rgba(255, 255, 255, 0.08)',
          },
          Menu: {
            colorItemText: '#a0aec0',
            colorItemTextHover: '#ffffff',
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
