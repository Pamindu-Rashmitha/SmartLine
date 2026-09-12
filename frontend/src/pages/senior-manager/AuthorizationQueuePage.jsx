import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, message } from 'antd';
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import authorizationApi from '../../api/authorizationApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const AuthorizationQueuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await authorizationApi.getAuthorizationQueue({
        page: pagination.page,
        size: pagination.size,
      });

      if (res.data) {
        setApplications(res.data.content || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.totalElements,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch authorization queue:', err);
      message.error('Failed to load executive authorization queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [pagination.page]);

  const filteredApplications = applications.filter((app) => {
    return (
      !search ||
      app.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantNic?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalExposure = applications.reduce(
    (sum, a) => sum + Number(a.requestedAmount || 0),
    0
  );

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.id}/authorize`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name, record) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs block">{name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">NIC: {record.applicantNic}</span>
        </div>
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
      title: 'Sanction Exposure',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
            LKR {Number(amount || 0).toLocaleString()}
          </span>
          {Number(amount || 0) > 500000 && (
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" /> High-Value Policy Threshold
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Monthly EMI',
      dataIndex: 'monthlyEmi',
      key: 'monthlyEmi',
      render: (emi, record) => (
        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold font-mono">
          {emi ? `LKR ${Number(emi).toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Submitted At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/applications/${record.id}/authorize`)}
          className="bg-indigo-600 hover:bg-indigo-500 font-semibold border-0 text-xs flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Executive Sanction</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 p-6 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>SENIOR MANAGEMENT & HIGHER-LEVEL AUTHORIZATION DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Executive Sanction Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed m-0">
              Applications with facility values exceeding the delegated LKR 500,000 threshold or referred by Credit Managers for executive authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchQueue}
              loading={loading}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-semibold text-xs"
            >
              Refresh Queue
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Sanctions Pending"
          value={applications.length}
          icon={Scale}
          color="purple"
          subtitle="Awaiting Senior Manager approval"
        />
        <StatCard
          title="Total Exposure Under Review"
          value={`LKR ${(totalExposure / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          color="emerald"
          subtitle="Cumulative facility requests"
        />
        <StatCard
          title="Policy Threshold"
          value="LKR 500,000"
          icon={AlertTriangle}
          color="amber"
          subtitle="Mandatory Senior authorization"
        />
      </div>

      {/* Main Table Card */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-80">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              placeholder="Search by ref # or borrower name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg text-xs"
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredApplications.map((app) => ({ ...app, key: app.id }))}
          loading={loading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (p) => setPagination((prev) => ({ ...prev, page: p - 1 })),
            showTotal: (total) => `Total ${total} sanctions awaiting authorization`,
            className: 'text-slate-600 dark:text-slate-400 text-xs',
          }}
          size="middle"
          scroll={{ x: 900 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default AuthorizationQueuePage;
