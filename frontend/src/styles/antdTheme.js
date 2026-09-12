import { theme } from 'antd';

export const lightThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#0284c7',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorTextBase: '#0f172a',
    colorTextSecondary: '#64748b',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      primaryShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
    },
    Input: {
      controlHeight: 42,
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      colorBorder: '#cbd5e1',
    },
    Select: {
      controlHeight: 42,
      borderRadius: 8,
      colorBgContainer: '#ffffff',
      colorBorder: '#cbd5e1',
    },
    Card: {
      colorBgContainer: '#ffffff',
      borderRadiusLG: 12,
    },
    Menu: {
      itemBg: '#ffffff',
      itemSelectedBg: '#eff6ff',
      itemSelectedColor: '#1d4ed8',
      itemHoverBg: '#f8fafc',
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: '#f8fafc',
      headerColor: '#334155',
      rowHoverBg: '#f8fafc',
      borderColor: '#e2e8f0',
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0284c7',
    colorBgBase: '#070c18',
    colorBgContainer: '#0f172a',
    colorBgElevated: '#1e293b',
    colorBgLayout: '#070c18',
    colorBorder: '#1e293b',
    colorBorderSecondary: '#334155',
    colorTextBase: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      primaryShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
    },
    Input: {
      controlHeight: 42,
      borderRadius: 8,
      colorBgContainer: '#0b1120',
    },
    Select: {
      controlHeight: 42,
      borderRadius: 8,
      colorBgContainer: '#0b1120',
    },
    Card: {
      colorBgContainer: '#0f172a',
      borderRadiusLG: 12,
    },
    Menu: {
      darkItemBg: '#0b1120',
      darkItemSelectedBg: '#2563eb',
      darkItemHoverBg: '#1e293b',
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
    Table: {
      colorBgContainer: '#0f172a',
      headerBg: '#1e293b',
      headerColor: '#cbd5e1',
      rowHoverBg: '#1e293b',
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export const customThemeConfig = darkThemeConfig;
