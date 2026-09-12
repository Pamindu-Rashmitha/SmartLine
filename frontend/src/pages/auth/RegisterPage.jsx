import React, { useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Alert, message } from 'antd';
import { User, Mail, Lock, Phone, CreditCard, Briefcase, MapPin, ArrowRight, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Option } = Select;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await register({
        ...values,
        role: 'APPLICANT',
      });
      message.success('Registration successful! Welcome to Smart Line Investment');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 relative transition-colors duration-200">
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

      <div className="relative w-full max-w-xl z-10 my-8">
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
            Create Borrower Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for personal, business, or leasing financing in minutes
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-200">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="fullName"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Full Name</span>}
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input
                  prefix={<User className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="e.g. Kasun Chamara"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Email Address</span>}
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="kasun@example.com"
                />
              </Form.Item>

              <Form.Item
                name="username"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Username</span>}
                rules={[{ required: true, message: 'Username is required' }]}
              >
                <Input
                  placeholder="kasun123"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Password</span>}
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Minimum 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Mobile Phone</span>}
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input
                  prefix={<Phone className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="+94 77 123 4567"
                />
              </Form.Item>

              <Form.Item
                name="nicNumber"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">National Identity Card (NIC)</span>}
                rules={[{ required: true, message: 'NIC is required' }]}
              >
                <Input
                  prefix={<CreditCard className="w-4 h-4 text-slate-400 mr-1.5" />}
                  placeholder="e.g. 199512345678"
                />
              </Form.Item>

              <Form.Item
                name="employmentStatus"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Employment Status</span>}
                initialValue="EMPLOYED"
              >
                <Select>
                  <Option value="EMPLOYED">Salaried Employee</Option>
                  <Option value="SELF_EMPLOYED">Self Employed / Freelancer</Option>
                  <Option value="BUSINESS_OWNER">Business Owner</Option>
                  <Option value="PROFESSIONAL">Professional Practitioner</Option>
                  <Option value="RETIRED">Retired</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="monthlyIncome"
                label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Monthly Gross Income (LKR)</span>}
                rules={[{ required: true, message: 'Income is required' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="150000"
                  formatter={(val) => (val ? `Rs. ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                  parser={(val) => val.replace(/Rs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="city"
              label={<span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Residential City</span>}
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input
                prefix={<MapPin className="w-4 h-4 text-slate-400 mr-1.5" />}
                placeholder="Colombo, Kandy, Gampaha..."
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="mt-2 bg-blue-600 hover:bg-blue-500 h-11 text-base font-semibold border-0 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              Complete Registration <ArrowRight className="w-4 h-4" />
            </Button>
          </Form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
