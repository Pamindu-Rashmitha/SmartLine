import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, Select, Space, Row, Col, message } from 'antd';
import {
  FileText,
  Search,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import verificationApi from '../../api/verificationApi';
import applicationApi from '../../api/applicationApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { Option } = Select;

const LoanPipelinePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.searchApplications({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
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
      console.error('Failed to fetch pipeline:', err);
      message.error('Failed to load application queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [pagination.page, statusFilter, typeFilter]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchPipeline();
  };

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.id}/verify`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Applicant Name',
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
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-200">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Monthly EMI',
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
      title: 'KYC Files',
      dataIndex: 'documentCount',
      key: 'documentCount',
      render: (count, record) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {count} Docs • {record.guarantorCount} Guarantor(s)
        </span>
      ),
    },
    {
      title: 'Submitted On',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {date ? dayjs(date).format('YYYY-MM-DD') : 'Draft'}
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
          onClick={() => navigate(`/applications/${record.id}/verify`)}
          className="bg-blue-600 hover:bg-blue-500 font-medium text-xs shadow-sm"
        >
          Review & Verify
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <CheckSquare className="w-6 h-6" />
            </span>
            Loan & Lease Underwriting Pipeline
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Application verification queue for Loan Officers and Credit Analysts
          </p>
        </div>
        <Button onClick={fetchPipeline} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-medium">
          Refresh Queue
        </Button>
      </div>

      {/* KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total in Queue"
            value={pagination.total}
            icon={FileText}
            color="blue"
            subtitle="All active applications"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Awaiting Verification"
            value={applications.filter((a) => a.status === 'SUBMITTED').length}
            icon={Clock}
            color="amber"
            subtitle="Ready for appraisal"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Under Review"
            value={applications.filter((a) => a.status === 'UNDER_VERIFICATION').length}
            icon={CheckSquare}
            color="purple"
            subtitle="Assigned to officers"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Verified Pass"
            value={applications.filter((a) => a.status === 'VERIFIED').length}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Forwarded to Credit Desk"
          />
        </Col>
      </Row>

      {/* Search & Filter Bar */}
      <Card className="bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Search Reference #, Applicant Name, or NIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="md:w-80 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            allowClear
          />

          <div className="flex flex-wrap gap-2 items-center">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-44"
              placeholder="Status"
            >
              <Option value="">All Statuses</Option>
              <Option value="SUBMITTED">Submitted</Option>
              <Option value="UNDER_VERIFICATION">Under Verification</Option>
              <Option value="VERIFIED">Verified</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-40"
              placeholder="Facility Type"
            >
              <Option value="">All Types</Option>
              <Option value="LOAN">Money Loan</Option>
              <Option value="VEHICLE_LEASE">Vehicle Lease</Option>
            </Select>

            <Button type="primary" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 font-medium shadow-sm">
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Pipeline Table */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden p-0 transition-colors duration-200">
        <Table
          dataSource={applications}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (p) => setPagination((prev) => ({ ...prev, page: p - 1 })),
            showTotal: (total) => `Total ${total} cases`,
          }}
        />
      </Card>
    </div>
  );
};

export default LoanPipelinePage;
