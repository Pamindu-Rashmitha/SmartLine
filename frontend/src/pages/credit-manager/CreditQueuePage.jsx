import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, Select, Row, Col, message } from 'antd';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Car,
  DollarSign,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import creditApi from '../../api/creditApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { Option } = Select;

const CreditQueuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await creditApi.getCreditQueue({
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
      console.error('Failed to fetch credit queue:', err);
      message.error('Failed to load credit assessment queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [pagination.page]);

  const filteredApplications = applications.filter((app) => {
    const matchesType = !typeFilter || app.type === typeFilter;
    const matchesSearch =
      !search ||
      app.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantNic?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const verifiedCount = applications.filter((a) => a.status === 'VERIFIED').length;
  const inProgressCount = applications.filter((a) => a.status === 'UNDER_CREDIT_ASSESSMENT').length;
  const inspectionReturnedCount = applications.filter((a) => a.status === 'FIELD_INSPECTION_COMPLETED').length;

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.id}/assess`)}
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
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
            LKR {Number(amount || 0).toLocaleString()}
          </span>
          {Number(amount || 0) > 500000 && (
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold block flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" /> &gt; 500k Threshold
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Tenure',
      dataIndex: 'tenureMonths',
      key: 'tenureMonths',
      render: (tenure, record) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {tenure || '-'} Mo {record.monthlyEmi ? `(@ LKR ${Number(record.monthlyEmi).toLocaleString()}/mo)` : ''}
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
      title: 'KYC Verified By',
      dataIndex: 'verifiedByName',
      key: 'verifiedByName',
      render: (name) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {name || 'Loan Officer'}
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
          onClick={() => navigate(`/applications/${record.id}/assess`)}
          className="bg-purple-600 hover:bg-purple-500 font-semibold border-0 text-xs flex items-center gap-1.5"
        >
          <span>Appraise</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-purple-500/20 p-6 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UNDERWRITING & CREDIT APPRAISAL DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Credit Assessment Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed m-0">
              Appraise verified loan and leasing applications, review financial background, inspect guarantor collateral, request field surveys, and record sanction recommendations.
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total in Queue"
          value={applications.length}
          icon={ShieldCheck}
          color="purple"
          subtitle="Awaiting credit decision"
        />
        <StatCard
          title="Ready for Appraisal"
          value={verifiedCount}
          icon={CheckCircle2}
          color="blue"
          subtitle="KYC Verified by Loan Officer"
        />
        <StatCard
          title="Under Active Review"
          value={inProgressCount}
          icon={Clock}
          color="amber"
          subtitle="Currently being appraised"
        />
        <StatCard
          title="Inspection Completed"
          value={inspectionReturnedCount}
          icon={Car}
          color="emerald"
          subtitle="Valuation report attached"
        />
      </div>

      {/* Main Table Card */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-80">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              placeholder="Search by ref #, customer or NIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Select
              placeholder="Facility Type"
              value={typeFilter || undefined}
              onChange={(val) => setTypeFilter(val || '')}
              allowClear
              className="w-40 text-xs"
            >
              <Option value="">All Facilities</Option>
              <Option value="LOAN">Money Loan</Option>
              <Option value="VEHICLE_LEASE">Vehicle Lease</Option>
            </Select>
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
            showTotal: (total) => `Total ${total} cases`,
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

export default CreditQueuePage;
