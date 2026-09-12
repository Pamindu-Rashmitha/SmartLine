import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const { Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <AppSidebar collapsed={collapsed} />
      <Layout className="bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
