import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  Switch,
  message,
  Avatar,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Phone,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import dayjs from 'dayjs';
import adminApi from '../../api/adminApi';
import StatCard from '../../components/common/StatCard';

const { Option } = Select;

const ROLE_CONFIG = {
  ADMIN: { label: 'Administrator', color: 'red', bg: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30' },
  SENIOR_MANAGER: { label: 'Senior Manager', color: 'purple', bg: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30' },
  CREDIT_MANAGER: { label: 'Credit Manager', color: 'geekblue', bg: 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' },
  LOAN_OFFICER: { label: 'Loan Officer', color: 'blue', bg: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30' },
  FIELD_OFFICER: { label: 'Field Officer', color: 'cyan', bg: 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30' },
  LEGAL_OFFICER: { label: 'Legal Officer', color: 'gold', bg: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' },
  FINANCE_OFFICER: { label: 'Finance Officer', color: 'green', bg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
  CREDIT_CONTROL_OFFICER: { label: 'Credit Control Officer', color: 'orange', bg: 'bg-orange-50 dark:bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/30' },
  APPLICANT: { label: 'Applicant / Borrower', color: 'default', bg: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
};

const STAFF_ROLES = [
  'LOAN_OFFICER',
  'FIELD_OFFICER',
  'CREDIT_MANAGER',
  'SENIOR_MANAGER',
  'LEGAL_OFFICER',
  'FINANCE_OFFICER',
  'CREDIT_CONTROL_OFFICER',
  'ADMIN',
];

const UserManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    applicantUsers: 0,
    staffUsers: 0,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getUserStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
        active: activeFilter !== null ? activeFilter : undefined,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      const res = await adminApi.getUsers(params);
      if (res.data) {
        setUsers(res.data.content || []);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.data.totalElements || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      message.error(err.response?.data?.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers(1, pagination.pageSize);
  }, [roleFilter, activeFilter]);

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize);
  };

  const handleCreateStaff = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createUser(values);
      message.success(`Staff user "${values.username}" provisioned successfully`);
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchUsers(1, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.updateUser(selectedUser.id, values);
      message.success('User updated successfully');
      setEditModalOpen(false);
      fetchUsers(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user, newStatus) => {
    try {
      await adminApi.toggleUserStatus(user.id, newStatus);
      message.success(`User ${user.username} is now ${newStatus ? 'active' : 'suspended'}`);
      fetchUsers(pagination.current, pagination.pageSize);
      fetchStats();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to change account status');
    }
  };

  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.resetPassword(selectedUser.id, { newPassword: values.newPassword });
      message.success(`Password reset for ${selectedUser.username}`);
      setResetModalOpen(false);
      resetForm.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (record) => {
    setSelectedUser(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      role: record.role,
      active: record.active,
    });
    setEditModalOpen(true);
  };

  const openResetModal = (record) => {
    setSelectedUser(record);
    resetForm.resetFields();
    setResetModalOpen(true);
  };

  const columns = [
    {
      title: 'User Profile',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white flex-shrink-0">
            {record.fullName?.charAt(0) || record.username?.charAt(0) || 'U'}
          </Avatar>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
              {record.fullName}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Details',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{record.email}</span>
          </div>
          {record.phoneNumber && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{record.phoneNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'System Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const config = ROLE_CONFIG[role] || { label: role, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            active
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {active ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      title: 'Registered On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {date ? dayjs(date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip title="Edit Profile & Role">
            <Button
              size="small"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => openEditModal(record)}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            />
          </Tooltip>

          <Tooltip title="Reset Password">
            <Button
              size="small"
              icon={<KeyRound className="w-3.5 h-3.5" />}
              onClick={() => openResetModal(record)}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 border-slate-200 dark:border-slate-700"
            />
          </Tooltip>

          <Popconfirm
            title={record.active ? 'Deactivate User Account?' : 'Activate User Account?'}
            description={
              record.active
                ? 'This user will be blocked from logging in.'
                : 'This user will be permitted to access the system.'
            }
            onConfirm={() => handleToggleStatus(record, !record.active)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Button
              size="small"
              icon={record.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              danger={record.active}
              className={!record.active ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : ''}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
              User Directory & Staff Lifecycle Desk
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-0">
            Provision staff user accounts across 9 organizational roles, modify access permissions, and manage password policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 font-semibold border-0 shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Registered Accounts"
            value={stats.totalUsers}
            subtitle="All roles in database"
            icon={Users}
            color="blue"
            trend="Active Directory"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Operational Staff"
            value={stats.staffUsers}
            subtitle="Internal officers & managers"
            icon={ShieldCheck}
            color="purple"
            trend="8 Staff Roles"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Borrowers & Applicants"
            value={stats.applicantUsers}
            subtitle="Self-registered loan clients"
            icon={UserIcon}
            color="emerald"
            trend="External Book"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Suspended Accounts"
            value={stats.inactiveUsers}
            subtitle="Access blocked"
            icon={UserX}
            color={stats.inactiveUsers > 0 ? 'rose' : 'amber'}
            trend={stats.inactiveUsers > 0 ? 'Action Required' : 'All Clear'}
            trendType={stats.inactiveUsers > 0 ? 'down' : 'up'}
          />
        </Col>
      </Row>

      {/* Filter and Main Table */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-5">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Input
              placeholder="Search Name, Username, or Email..."
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              className="w-full sm:w-72 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              allowClear
            />

            <Select
              placeholder="Filter by Role"
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              className="w-full sm:w-48"
              allowClear
            >
              {Object.keys(ROLE_CONFIG).map((role) => (
                <Option key={role} value={role}>
                  {ROLE_CONFIG[role].label}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter Status"
              value={activeFilter}
              onChange={(val) => setActiveFilter(val)}
              className="w-full sm:w-36"
              allowClear
            >
              <Option value={true}>Active Only</Option>
              <Option value={false}>Suspended Only</Option>
            </Select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => {
                fetchUsers(pagination.current, pagination.pageSize);
                fetchStats();
              }}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
            className: 'text-slate-600 dark:text-slate-400',
          }}
          className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden"
        />
      </Card>

      {/* Modal: Create Staff User */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Provision New Staff Member Account</span>
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateStaff} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Full Name</span>}
                name="fullName"
                rules={[
                  { required: true, message: 'Please enter staff member full name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                  { pattern: /^[a-zA-Z\s.'-]+$/, message: 'Name can only contain letters, spaces, and hyphens' },
                ]}
              >
                <Input placeholder="e.g. Kasun Fernando" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Username</span>}
                name="username"
                rules={[
                  { required: true, message: 'Please specify unique username' },
                  { min: 3, max: 30, message: 'Username must be 3–30 characters' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' },
                ]}
              >
                <Input placeholder="e.g. kasunf" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Official Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter valid email' },
                  { type: 'email', message: 'Invalid email address' },
                ]}
              >
                <Input placeholder="kasun@smartline.lk" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Phone Number</span>}
                name="phoneNumber"
                rules={[
                  { pattern: /^(\+94|0)[0-9]{9}$/, message: 'Enter a valid Sri Lankan phone (e.g. +94771234567 or 0771234567)' },
                ]}
              >
                <Input placeholder="+94 77 123 4567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Departmental Role</span>}
                name="role"
                rules={[{ required: true, message: 'Select system role' }]}
              >
                <Select placeholder="Select Organizational Role">
                  {STAFF_ROLES.map((r) => (
                    <Option key={r} value={r}>
                      {ROLE_CONFIG[r]?.label || r}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Temporary Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Set initial password' },
                  { min: 6, message: 'Minimum 6 characters' },
                  { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: 'Must contain at least 1 letter and 1 number' },
                ]}
              >
                <Input.Password placeholder="Min. 6 characters" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600 hover:bg-blue-500 font-semibold">
              Provision Staff Account
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Edit User: {selectedUser?.username}</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditUser} className="mt-4">
          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Full Name</span>}
            name="fullName"
            rules={[
              { required: true, message: 'Please enter name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { pattern: /^[a-zA-Z\s.'-]+$/, message: 'Name can only contain letters, spaces, and hyphens' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Email Address</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Phone Number</span>} name="phoneNumber">
            <Input />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Role Assignment</span>}
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              {Object.keys(ROLE_CONFIG).map((r) => (
                <Option key={r} value={r}>
                  {ROLE_CONFIG[r].label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Account Status</span>}
            name="active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Suspended" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600 hover:bg-blue-500 font-semibold">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal: Reset Password */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <KeyRound className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span>Reset Password for @{selectedUser?.username}</span>
          </div>
        }
        open={resetModalOpen}
        onCancel={() => setResetModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword} className="mt-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Enter a new password for <span className="text-slate-900 dark:text-white font-semibold">{selectedUser?.fullName}</span>. The user will be able to log in immediately with these new credentials.
          </p>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">New Password</span>}
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
              { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: 'Must contain at least 1 letter and 1 number' },
            ]}
          >
            <Input.Password placeholder="Min. 6 characters" />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Confirm New Password</span>}
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter password" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-amber-600 hover:bg-amber-500 border-0 font-semibold text-white">
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
