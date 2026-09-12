import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Input, Select, Row, Col, message, Tabs, Badge, Button } from 'antd';
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
  FileCheck,
  Clock,
} from 'lucide-react';
import financeApi from '../../api/financeApi';
import repaymentApi from '../../api/repaymentApi';
import StatCard from '../../components/common/StatCard';
import InstallmentScheduleModal from '../../components/facility/InstallmentScheduleModal';
import PaymentProofReviewModal from '../../components/facility/PaymentProofReviewModal';
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

  // Payment Proof Review States
  const [activeTab, setActiveTab] = useState('facilities');
  const [pendingProofs, setPendingProofs] = useState([]);
  const [pendingProofsLoading, setPendingProofsLoading] = useState(false);
  const [selectedProofForReview, setSelectedProofForReview] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

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

  const fetchPendingProofs = useCallback(async () => {
    setPendingProofsLoading(true);
    try {
      const res = await repaymentApi.getPendingProofs();
      if (res.success && res.data) {
        setPendingProofs(res.data);
      }
    } catch (err) {
      console.error('Failed to load pending proofs:', err);
    } finally {
      setPendingProofsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [statusFilter]);

  useEffect(() => {
    fetchPendingProofs();
  }, [fetchPendingProofs]);

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
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{text}</span>
      ),
    },
    {
      title: 'Application Ref',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text) => (
        <span className="font-mono text-blue-600 dark:text-blue-400 text-xs">{text}</span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (text) => <span className="font-medium text-slate-900 dark:text-slate-200">{text}</span>,
    },
    {
      title: 'Facility Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          {type === 'VEHICLE_LEASE' ? (
            <>
              <Car className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Vehicle Lease</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
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
          <div className="font-mono text-blue-600 dark:text-blue-400 text-xs font-semibold">
            LKR {Number(amt).toLocaleString()}/mo
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{record.tenureMonths} Months</div>
        </div>
      ),
    },
    {
      title: 'Outstanding Balance',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      render: (amt) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          LKR {Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Term Period',
      key: 'term',
      render: (_, record) => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
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

  const proofColumns = [
    {
      title: 'Facility Number',
      dataIndex: 'facilityNumber',
      key: 'facilityNumber',
      render: (text) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{text}</span>
      ),
    },
    {
      title: 'Borrower',
      key: 'borrower',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-200">{record.borrowerName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{record.borrowerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Settling Installment',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      render: (num) => (
        <Tag color="purple" className="font-semibold text-xs">
          EMI #{num}
        </Tag>
      ),
    },
    {
      title: 'Claimed Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amt) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          LKR {Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Slip / Txn Ref',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (ref) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">{ref || 'N/A'}</span>
      ),
    },
    {
      title: 'Channel',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (m) => <Tag color="cyan" className="text-[10px]">{m}</Tag>,
    },
    {
      title: 'Deposit Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {date ? dayjs(date).format('DD MMM YYYY') : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs border-none flex items-center gap-1 mx-auto"
          onClick={() => {
            setSelectedProofForReview(record);
            setReviewModalVisible(true);
          }}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Review Slip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
              Active Credit & Lease Facilities
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 mb-0">
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
            icon={Layers}
            color="emerald"
            trend="Performing Book"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Outstanding Portfolio"
            value={`LKR ${(totalOutstanding / 1000000).toFixed(2)}M`}
            subtitle="Current portfolio balance"
            icon={DollarSign}
            color="blue"
            trend="Monitored"
            trendType="neutral"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Disbursed Volume"
            value={`LKR ${(totalPrincipal / 1000000).toFixed(2)}M`}
            subtitle="Original funded capital"
            icon={TrendingUp}
            color="indigo"
            trend="Capital Outlay"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Slip Verifications"
            value={pendingProofs.length}
            subtitle="Borrower uploaded payment proofs"
            icon={FileCheck}
            color="purple"
            trend={pendingProofs.length > 0 ? "Action Required" : "All Clear"}
            trendType={pendingProofs.length > 0 ? "down" : "up"}
          />
        </Col>
      </Row>

      {/* Desk Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="custom-desk-tabs"
        items={[
          {
            key: 'facilities',
            label: (
              <span className="flex items-center gap-2 px-1 font-semibold text-xs">
                <Layers className="w-3.5 h-3.5" />
                Active Lending Facilities
                <Tag color="blue" className="ml-1 text-[10px]">{activeCount}</Tag>
              </span>
            ),
            children: (
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-5">
                  <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                    <Input
                      placeholder="Search by facility #, app #, borrower..."
                      prefix={<Search className="w-4 h-4 text-slate-400" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-full sm:w-72"
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

                  <div className="text-xs text-slate-600 dark:text-slate-400 w-full sm:w-auto text-right">
                    Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{filtered.length}</span> active facilities
                  </div>
                </div>

                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 8 }}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                />
              </Card>
            ),
          },
          {
            key: 'slips',
            label: (
              <span className="flex items-center gap-2 px-1 font-semibold text-xs">
                <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                Pending Slip Verifications
                {pendingProofs.length > 0 && (
                  <Badge count={pendingProofs.length} overflowCount={99} className="ml-1" />
                )}
              </span>
            ),
            children: (
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                      Borrower Payment Slips Awaiting Review
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                      Verify deposit receipts and approve to settle installment balances automatically
                    </p>
                  </div>
                  <Button
                    size="small"
                    onClick={fetchPendingProofs}
                    loading={pendingProofsLoading}
                  >
                    Refresh Slips
                  </Button>
                </div>

                <Table
                  columns={proofColumns}
                  dataSource={pendingProofs}
                  rowKey="id"
                  loading={pendingProofsLoading}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'No pending payment slips awaiting verification' }}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Schedule Modal */}
      <InstallmentScheduleModal
        visible={scheduleModalVisible}
        facility={selectedFacilityForSchedule}
        onClose={() => {
          setScheduleModalVisible(false);
          setSelectedFacilityForSchedule(null);
        }}
        onRefreshFacility={() => {
          fetchFacilities();
          fetchPendingProofs();
        }}
      />

      {/* Payment Proof Review Modal */}
      <PaymentProofReviewModal
        visible={reviewModalVisible}
        proof={selectedProofForReview}
        onClose={() => {
          setReviewModalVisible(false);
          setSelectedProofForReview(null);
        }}
        onSuccess={() => {
          fetchPendingProofs();
          fetchFacilities();
        }}
      />
    </div>
  );
};

export default FacilityListPage;
