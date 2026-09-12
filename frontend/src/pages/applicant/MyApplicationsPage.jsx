import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Space, Input, Select, Empty, Spin, message } from 'antd';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { Option } = Select;

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getMyApplications();
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      message.error('Failed to load application history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchSearch =
      !search ||
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      (app.purpose && app.purpose.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Facility Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'LOAN' ? 'blue' : 'purple'} className="text-xs font-semibold">
          {type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
        </Tag>
      ),
    },
    {
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-200">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Est. Monthly EMI',
      dataIndex: 'monthlyEmi',
      key: 'monthlyEmi',
      render: (val) => (
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          {val ? `LKR ${Number(val).toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date, record) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {date ? dayjs(date).format('YYYY-MM-DD HH:mm') : dayjs(record.createdAt).format('YYYY-MM-DD (Draft)')}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/applications/${record.id}`)}
          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs shadow-sm"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <FileText className="w-6 h-6" />
            </span>
            My Loan & Lease Applications
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track status, uploaded documents, and underwriting milestones in real time
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/applications/new')}
          className="bg-blue-600 hover:bg-blue-500 font-semibold shadow-md shadow-blue-600/20"
        >
          New Application
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search by Reference # or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-80 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            allowClear
          />
          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-48"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="DRAFT">Draft</Option>
              <Option value="SUBMITTED">Submitted</Option>
              <Option value="UNDER_VERIFICATION">Under Verification</Option>
              <Option value="VERIFIED">Verified</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
            <Button onClick={fetchApplications} size="middle" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-medium">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden p-0 transition-colors duration-200">
        <Table
          dataSource={filteredApps}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} applications` }}
          locale={{
            emptyText: (
              <Empty
                description={<span className="text-slate-400">No applications found</span>}
                className="py-12"
              >
                <Button type="primary" onClick={() => navigate('/applications/new')}>
                  Submit Your First Application
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default MyApplicationsPage;
