import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { customThemeConfig } from './styles/antdTheme';

function App() {
  return (
    <ConfigProvider theme={customThemeConfig}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
