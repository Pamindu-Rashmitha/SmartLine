import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// 9 Demo accounts pre-configured with backend DataInitializer
const DEMO_ACCOUNTS = [
  { label: 'Admin', role: 'ADMIN', user: 'admin', pass: 'admin123', color: 'border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10' },
  { label: 'Loan Officer', role: 'LOAN_OFFICER', user: 'loanofficer', pass: 'officer123', color: 'border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10' },
  { label: 'Field Officer', role: 'FIELD_OFFICER', user: 'fieldofficer', pass: 'field123', color: 'border-teal-200 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10' },
  { label: 'Credit Manager', role: 'CREDIT_MANAGER', user: 'creditmanager', pass: 'manager123', color: 'border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10' },
  { label: 'Senior Manager', role: 'SENIOR_MANAGER', user: 'seniormanager', pass: 'senior123', color: 'border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10' },
  { label: 'Legal Officer', role: 'LEGAL_OFFICER', user: 'legalofficer', pass: 'legal123', color: 'border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10' },
  { label: 'Finance Officer', role: 'FINANCE_OFFICER', user: 'financeofficer', pass: 'finance123', color: 'border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' },
  { label: 'Credit Control', role: 'CREDIT_CONTROL_OFFICER', user: 'creditcontrol', pass: 'creditcontrol123', color: 'border-orange-200 dark:border-orange-500/40 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10' },
  { label: 'Borrower', role: 'APPLICANT', user: 'applicant', pass: 'applicant123', color: 'border-sky-200 dark:border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10' },
];

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(values.usernameOrEmail, values.password);
      message.success('Welcome back to Smart Line Investment');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demo) => {
    form.setFieldsValue({
      usernameOrEmail: demo.user,
      password: demo.pass,
    });
    setLoading(true);
    setErrorMsg('');
    try {
      await login(demo.user, demo.pass);
      message.success(`Logged in as ${demo.label}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 relative transition-colors duration-200">
      {/* Theme Toggle Top-Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all cursor-pointer flex items-center justify-center"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Background glow effects for dark mode */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            SMART LINE
          </h1>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-1 mb-0">
            Loan & Leasing Management System
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-xl dark:shadow-2xl p-6 sm:p-8 transition-colors duration-200">
          <div className="flex items-center justify-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white m-0">Account Sign In</h2>
          </div>

          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMsg('')}
              className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
            />
          )}

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="usernameOrEmail"
              rules={[{ required: true, message: 'Please enter your username or email' }]}
            >
              <Input
                prefix={<User className="w-4 h-4 text-slate-400 mr-2" />}
                placeholder="Username or Email address"
                size="large"
                className="hover:border-blue-500 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<Lock className="w-4 h-4 text-slate-400 mr-2" />}
                placeholder="Password"
                size="large"
                className="hover:border-blue-500 focus:border-blue-500"
              />
            </Form.Item>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0" />
                Remember me
              </label>
              <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">Forgot password?</span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-blue-600 hover:bg-blue-500 h-11 text-base font-semibold border-0 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </Form>

          {/* Quick Demo Switcher */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Click Demo Accounts (Fast Testing)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoFill(demo)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border bg-slate-50 dark:bg-slate-950/60 transition-all text-left truncate cursor-pointer ${demo.color}`}
                  title={`Log in as ${demo.label} (${demo.role})`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            New loan applicant?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
