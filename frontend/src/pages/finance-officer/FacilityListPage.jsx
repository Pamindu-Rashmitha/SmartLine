import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Input, Select, Row, Col, message } from 'antd';
import {
  Layers,
  Search,
  CheckCircle2,
  Car,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import financeApi from '../../api/financeApi';
import StatCard from '../../components/common/StatCard';
import InstallmentScheduleModal from '../../components/facility/InstallmentScheduleModal';
import { Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const FacilityListPage = () => {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFacilityForSchedule, setSelectedFacilityForSchedule] = useState(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getFacilities(statusFilter || undefined);
      if (res.data) {
        setFacilities(res.data);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
      message.error('Failed to load active facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [statusFilter]);

  const filtered = facilities.filter((f) => {
    const matchesType = !typeFilter || f.type === typeFilter;
    const matchesSearch =
      !search ||
      f.facilityNumber?.toLowerCase().includes(search.toLowerCase()) ||
      f.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      f.applicantName?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeCount = facilities.filter((f) => f.status === 'ACTIVE').length;
  const completedCount = facilities.filter((f) => f.status === 'COMPLETED').length;
  const totalOutstanding = facilities.reduce((sum, f) => sum + Number(f.outstandingBalance || 0), 0);
  const totalPrincipal = facilities.reduce((sum, f) => sum + Number(f.principalAmount || 0), 0);

  const columns = [
    {
      title: 'Facility Number',
      dataIndex: 'facilityNumber',
      key: 'facilityNumber',
      render: (text) => (
        <span className="font-mono font-bold text-emerald-400">{text}</span>
      ),
    },
    {
      title: 'Application Ref',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text) => (
        <span className="font-mono text-blue-400 text-xs">{text}</span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (text) => <span className="font-medium text-slate-200">{text}</span>,
    },
    {
      title: 'Facility Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
          {type === 'VEHICLE_LEASE' ? (
            <>
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Vehicle Lease</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Money Loan</span>
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Principal',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      render: (amt) => (
        <span className="font-mono font-semibold text-slate-200">
          LKR {Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Installment',
      dataIndex: 'installmentAmount',
      key: 'installmentAmount',
      render: (amt, record) => (
        <div>
          <div className="font-mono text-blue-400 text-xs font-semibold">
            LKR {Number(amt).toLocaleString()}/mo
          </div>
          <div className="text-[11px] text-slate-400">{record.tenureMonths} Months</div>
        </div>
      ),
    },
    {
      title: 'Outstanding Balance',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      render: (amt) => (
        <span className="font-mono font-bold text-slate-100">
          LKR {Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Term Period',
      key: 'term',
      render: (_, record) => (
        <div className="text-xs text-slate-400">
          <div>{dayjs(record.startDate).format('DD MMM YYYY')}</div>
          <div className="text-[11px] text-slate-500">to {dayjs(record.endDate).format('DD MMM YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color =
          status === 'ACTIVE'
            ? 'success'
            : status === 'COMPLETED'
            ? 'blue'
            : status === 'DEFAULTED'
            ? 'error'
            : 'default';
        return <Tag color={color} className="font-semibold">{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          className="bg-blue-600 hover:bg-blue-500 font-semibold text-xs border-none flex items-center gap-1 mx-auto"
          onClick={() => {
            setSelectedFacilityForSchedule(record);
            setScheduleModalVisible(true);
          }}
        >
          <Calendar className="w-3.5 h-3.5" />
          Schedule & Payments
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight m-0">
              Active Credit & Lease Facilities
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 mb-0">
            Portfolio monitoring of active disbursed loan and lease facilities across Smart Line Investment.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Facilities"
            value={activeCount}
            subtitle="Currently under repayment"
            icon={<Layers className="w-5 h-5 text-emerald-400" />}
            trend={{ text: 'Performing Book', positive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Portfolio Outstanding"
            value={`LKR ${(totalOutstanding / 1000000).toFixed(2)}M`}
            subtitle="Total receivable balance"
            icon={<DollarSign className="w-5 h-5 text-blue-400" />}
            trend={{ text: 'Principal + Interest', positive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Disbursed Volume"
            value={`LKR ${(totalPrincipal / 1000000).toFixed(2)}M`}
            subtitle="Original funded capital"
            icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
            trend={{ text: 'Capital Outlay', positive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Completed Facilities"
            value={completedCount}
            subtitle="Fully settled contracts"
            icon={<CheckCircle2 className="w-5 h-5 text-purple-400" />}
            trend={{ text: 'Matured', positive: true }}
          />
        </Col>
      </Row>

      {/* Filter and Table Card */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-5">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Input
              placeholder="Search by facility #, app #, borrower..."
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-500 w-full sm:w-72"
              allowClear
            />
            <Select
              placeholder="Facility Status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-40"
              allowClear
            >
              <Option value="">All Statuses</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="DEFAULTED">Defaulted</Option>
            </Select>
            <Select
              placeholder="Facility Type"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-40"
              allowClear
            >
              <Option value="">All Types</Option>
              <Option value="LOAN">Money Loan</Option>
              <Option value="VEHICLE_LEASE">Vehicle Lease</Option>
            </Select>
          </div>

          <div className="text-xs text-slate-400 w-full sm:w-auto text-right">
            Showing <span className="font-semibold text-slate-200">{filtered.length}</span> active facilities
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="ant-table-dark border border-slate-800 rounded-xl overflow-hidden"
        />
      </Card>

      <InstallmentScheduleModal
        visible={scheduleModalVisible}
        facility={selectedFacilityForSchedule}
        onClose={() => {
          setScheduleModalVisible(false);
          setSelectedFacilityForSchedule(null);
        }}
        onRefreshFacility={fetchFacilities}
      />
    </div>
  );
};

export default FacilityListPage;
