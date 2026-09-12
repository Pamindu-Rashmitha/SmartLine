import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Input, Select, Row, Col, message } from 'antd';
import {
  Scale,
  Search,
  CheckCircle2,
  Clock,
  Car,
  DollarSign,
  ArrowRight,
  FileCheck2,
  FileSignature,
  FileText,
} from 'lucide-react';
import agreementApi from '../../api/agreementApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { Option } = Select;

const LegalQueuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await agreementApi.getLegalQueue();
      if (res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch legal queue:', err);
      message.error('Failed to load legal agreements queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesType = !typeFilter || app.type === typeFilter;
    const matchesSearch =
      !search ||
      app.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantNic?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const pendingAgreementCount = applications.filter((a) => a.status === 'AGREEMENT_PENDING').length;
  const verifiedCount = applications.filter((a) => a.status === 'AGREEMENT_VERIFIED').length;

  const columns = [
    {
      title: 'Application Ref',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-blue-400 font-mono">{text}</span>
          <div className="text-xs text-slate-400">
            {dayjs(record.createdAt).format('DD MMM YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (text, record) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-200">{text}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">NIC: {record.applicantNic}</div>
        </div>
      ),
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
      title: 'Approved Principal',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
          LKR {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      title: 'Tenor & Installment',
      key: 'terms',
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {record.tenureMonths ? `${record.tenureMonths} Months` : '-'}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
            {record.monthlyEmi ? `LKR ${Number(record.monthlyEmi).toLocaleString()}/mo` : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const isVerified = record.status === 'AGREEMENT_VERIFIED';
        const isDraft = record.status === 'AGREEMENT_PENDING';
        return (
          <Button
            type="primary"
            icon={isVerified ? <FileCheck2 className="w-4 h-4" /> : <FileSignature className="w-4 h-4" />}
            onClick={() => navigate(`/applications/${record.id}/agreement`)}
            className={`flex items-center gap-1.5 text-xs font-medium ml-auto ${
              isVerified
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-600'
                : isDraft
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-600'
                : 'bg-blue-600 hover:bg-blue-500 border-blue-600'
            }`}
          >
            {isVerified ? 'View Agreement' : isDraft ? 'Finalize & Seal' : 'Prepare Agreement'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
              Legal Contracts & Agreements Desk
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 mb-0">
            Prepare, verify, and seal binding credit contracts and hypothecation deeds for approved facilities (US11, US12).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Awaiting Agreement Preparation"
            value={approvedCount}
            subtitle="Approved applications"
            icon={FileText}
            color="blue"
            trend="Ready for Drafting"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Draft Agreements"
            value={pendingAgreementCount}
            subtitle="In progress with Legal"
            icon={FileSignature}
            color="amber"
            trend="Requires Verification"
            trendType="down"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Verified & Sealed"
            value={verifiedCount}
            subtitle="Ready for Down Payment / Disbursal"
            icon={FileCheck2}
            color="emerald"
            trend="Legally Binding"
            trendType="up"
          />
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-5">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <Input
              placeholder="Search by ref, applicant, NIC..."
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 w-full sm:w-72"
              allowClear
            />
            <Select
              placeholder="Facility Type"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-44"
              allowClear
            >
              <Option value="">All Facilities</Option>
              <Option value="LOAN">Money Loan</Option>
              <Option value="VEHICLE_LEASE">Vehicle Lease</Option>
            </Select>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 w-full sm:w-auto text-right">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{filteredApplications.length}</span> agreements
          </div>
        </div>

        {/* Agreements Table */}
        <Table
          columns={columns}
          dataSource={filteredApplications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          locale={{
            emptyText: (
              <div className="py-12 text-center text-slate-500">
                <FileCheck2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <div className="font-medium text-slate-600 dark:text-slate-400">No applications pending legal review</div>
                <div className="text-xs text-slate-500 mt-1">All approved applications have been processed</div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default LegalQueuePage;
