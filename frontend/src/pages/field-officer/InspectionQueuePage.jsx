import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, Row, Col, message } from 'antd';
import {
  Car,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import inspectionApi from '../../api/inspectionApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const InspectionQueuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await inspectionApi.getInspectionQueue({
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
      console.error('Failed to fetch inspection queue:', err);
      message.error('Failed to load vehicle inspection queue');
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

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.id}/inspect`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Applicant',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name, record) => (
        <div>
          <span className="font-semibold text-slate-200 text-xs block">{name}</span>
          <span className="text-[11px] text-slate-400 font-mono">NIC: {record.applicantNic}</span>
        </div>
      ),
    },
    {
      title: 'Facility',
      dataIndex: 'type',
      key: 'type',
      render: () => (
        <Tag color="purple" className="text-xs font-semibold">
          Vehicle Lease
        </Tag>
      ),
    },
    {
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <span className="font-bold text-slate-100 text-xs">
          LKR {Number(amount || 0).toLocaleString()}
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
      title: 'Requested At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-xs text-slate-400">
          {date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'}
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
          onClick={() => navigate(`/applications/${record.id}/inspect`)}
          className="bg-emerald-600 hover:bg-emerald-500 font-semibold border-0 text-xs flex items-center gap-1.5"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Conduct Inspection</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-slate-900 border border-emerald-500/20 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>FIELD OPERATIONS & VEHICLE INSPECTION DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
              Vehicle Inspection Queue (US07)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed m-0">
              Assigned site and showroom visits for leased vehicles. Conduct physical & mechanical inspections, verify chassis/engine numbers, and evaluate collateral values.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchQueue}
              loading={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 font-semibold text-xs"
            >
              Refresh Queue
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Inspections Pending"
          value={applications.length}
          icon={Car}
          color="amber"
          subtitle="Awaiting Field Officer visit"
        />
        <StatCard
          title="Assigned Regions"
          value="Western Province"
          icon={Compass}
          color="blue"
          subtitle="Colombo & Gampaha dealers"
        />
        <StatCard
          title="Turnaround Target"
          value="< 24 Hours"
          icon={Clock}
          color="emerald"
          subtitle="High priority SLA"
        />
      </div>

      {/* Main Table Card */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="w-full sm:w-80">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              placeholder="Search by ref # or borrower name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-xs"
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
            showTotal: (total) => `Total ${total} inspections pending`,
            className: 'text-slate-400 text-xs',
          }}
          size="middle"
          scroll={{ x: 900 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default InspectionQueuePage;
