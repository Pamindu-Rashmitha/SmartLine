import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, Select, message } from 'antd';
import {
  Search,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Star,
  Car,
  Calendar,
  ArrowRight,
  Eye,
} from 'lucide-react';
import inspectionApi from '../../api/inspectionApi';
import StatCard from '../../components/common/StatCard';
import dayjs from 'dayjs';

const { Option } = Select;

const ratingConfig = {
  EXCELLENT: { color: 'green', label: 'Excellent' },
  GOOD: { color: 'blue', label: 'Good' },
  FAIR: { color: 'orange', label: 'Fair' },
  POOR: { color: 'red', label: 'Poor' },
};

const SiteInspectionReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await inspectionApi.getAllInspections();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inspection reports:', err);
      message.error('Failed to load inspection reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (r.applicationNumber || '').toLowerCase().includes(term) ||
      (r.applicantName || '').toLowerCase().includes(term) ||
      (r.vehicleMake || '').toLowerCase().includes(term) ||
      (r.vehicleModel || '').toLowerCase().includes(term) ||
      (r.engineNumber || '').toLowerCase().includes(term) ||
      (r.chassisNumber || '').toLowerCase().includes(term);
    const matchesRating = !ratingFilter || r.overallRating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const excellent = reports.filter((r) => r.overallRating === 'EXCELLENT').length;
  const good = reports.filter((r) => r.overallRating === 'GOOD').length;
  const fairPoor =
    reports.filter((r) => r.overallRating === 'FAIR').length +
    reports.filter((r) => r.overallRating === 'POOR').length;

  const columns = [
    {
      title: 'Reference #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <span
          className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          onClick={() => navigate(`/applications/${record.applicationId}/inspect`)}
        >
          {text || `INS-${record.id}`}
        </span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name, record) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs block">
            {name || 'Unknown'}
          </span>
          {record.applicantPhone && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {record.applicantPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs block">
            {record.vehicleMake} {record.vehicleModel}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {record.yearOfManufacture && (
              <Tag className="text-[10px] m-0 px-1.5 py-0 leading-4 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded">
                {record.yearOfManufacture}
              </Tag>
            )}
            {record.vehicleCategory && (
              <Tag className="text-[10px] m-0 px-1.5 py-0 leading-4 border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 rounded">
                {record.vehicleCategory}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Reg / Chassis #',
      key: 'serials',
      render: (_, record) => (
        <div>
          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 block">
            {record.registrationNumber || '—'}
          </span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {record.chassisNumber || '—'}
          </span>
        </div>
      ),
    },
    {
      title: 'Market Value',
      dataIndex: 'estimatedMarketValue',
      key: 'estimatedMarketValue',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Forced Sale',
      dataIndex: 'forcedSaleValue',
      key: 'forcedSaleValue',
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
          {val ? `LKR ${Number(val).toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'overallRating',
      key: 'overallRating',
      render: (rating) => {
        const config = ratingConfig[rating] || ratingConfig.GOOD;
        return (
          <Tag color={config.color} className="text-xs font-semibold">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Inspected On',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {date ? dayjs(date).format('YYYY-MM-DD') : 'N/A'}
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
          onClick={() => navigate(`/applications/${record.applicationId}/inspect`)}
          className="bg-emerald-600 hover:bg-emerald-500 font-semibold border-0 text-xs flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Report</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/20 p-6 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>FIELD INSPECTION & VALUATION REPORTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
              Site Inspection Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed m-0">
              Historical vehicle inspection and valuation reports from field visits.
              Review physical &amp; mechanical condition assessments, collateral valuations, and officer ratings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchReports}
              loading={loading}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-semibold text-xs"
            >
              Refresh Reports
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={ClipboardList}
          color="blue"
          subtitle="All inspection reports"
        />
        <StatCard
          title="Excellent"
          value={excellent}
          icon={Star}
          color="emerald"
          subtitle="Top rated inspections"
        />
        <StatCard
          title="Good"
          value={good}
          icon={CheckCircle2}
          color="purple"
          subtitle="Satisfactory condition"
        />
        <StatCard
          title="Fair / Poor"
          value={fairPoor}
          icon={AlertTriangle}
          color="amber"
          subtitle="Needs attention"
        />
      </div>

      {/* Main Table Card */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-80">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              placeholder="Search by ref #, applicant, vehicle, chassis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Select
              placeholder="All Ratings"
              value={ratingFilter || undefined}
              onChange={(val) => setRatingFilter(val || '')}
              allowClear
              className="w-40 text-xs"
            >
              <Option value="">All Ratings</Option>
              <Option value="EXCELLENT">Excellent</Option>
              <Option value="GOOD">Good</Option>
              <Option value="FAIR">Fair</Option>
              <Option value="POOR">Poor</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filtered.map((r) => ({ ...r, key: r.id }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} reports`,
            className: 'text-slate-600 dark:text-slate-400 text-xs',
          }}
          size="middle"
          scroll={{ x: 1100 }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default SiteInspectionReportsPage;
