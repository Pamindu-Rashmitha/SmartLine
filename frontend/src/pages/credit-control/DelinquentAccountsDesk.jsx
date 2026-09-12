import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Table, Card, Button, Tag, Input, Select, Modal, Form, DatePicker, message, Drawer, Timeline, Badge, Tooltip } from 'antd';
import {
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  User,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import repaymentApi from '../../api/repaymentApi';
import { useAuth } from '../../contexts/AuthContext';

const DelinquentAccountsDesk = () => {
  const { user } = useAuth();
  const [overdues, setOverdues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [agingFilter, setAgingFilter] = useState('ALL');

  // Follow-up recording modal state
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpForm] = Form.useForm();

  // Follow-up history drawer state
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchOverdues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await repaymentApi.getOverdueInstallments();
      if (res.success) {
        setOverdues(res.data || []);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load delinquent installments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdues();
  }, [fetchOverdues]);

  const handleOpenFollowUp = (record) => {
    setSelectedRecord(record);
    followUpForm.setFieldsValue({
      contactMethod: 'PHONE_CALL',
      contactOutcome: 'PROMISED_TO_PAY',
      nextFollowUpDate: dayjs().add(3, 'day'),
      notes: '',
    });
    setFollowUpModalVisible(true);
  };

  const handleRecordFollowUp = async (values) => {
    if (!selectedRecord) return;
    setFollowUpSubmitting(true);
    try {
      const payload = {
        contactMethod: values.contactMethod,
        contactOutcome: values.contactOutcome,
        notes: values.notes,
        nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.format('YYYY-MM-DD') : undefined,
      };

      await repaymentApi.recordFollowUp(selectedRecord.installmentId, payload);
      message.success('Recovery interaction follow-up logged successfully!');
      setFollowUpModalVisible(false);
      fetchOverdues();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to record follow-up');
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  const handleViewHistory = async (record) => {
    setSelectedRecord(record);
    setHistoryDrawerVisible(true);
    setHistoryLoading(true);
    try {
      const res = await repaymentApi.getInstallmentFollowUps(record.installmentId);
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (err) {
      message.error('Failed to load follow-up history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filtered overdues
  const filteredOverdues = overdues.filter((item) => {
    const matchesSearch =
      (item.borrowerName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.facilityNumber || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.borrowerPhone || '').includes(searchText) ||
      (item.borrowerNic || '').toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    const days = item.daysOverdue || 0;
    if (agingFilter === '1-14') return days <= 14;
    if (agingFilter === '15-30') return days > 14 && days <= 30;
    if (agingFilter === '30+') return days > 30;
    return true;
  });

  // KPI Calculations
  const totalOverdueAmount = overdues.reduce((sum, item) => sum + Number(item.overdueAmount || 0), 0);
  const criticalAccountsCount = overdues.filter((item) => (item.daysOverdue || 0) > 30).length;
  const promisedCount = overdues.filter((item) => item.lastFollowUpOutcome === 'PROMISED_TO_PAY').length;

  const columns = [
    {
      title: 'Facility Ref',
      dataIndex: 'facilityNumber',
      key: 'facilityNumber',
      render: (text, record) => (
        <div>
          <span className="font-mono text-xs font-bold text-blue-400 block">{text}</span>
          <Tag color="cyan" className="text-[10px] mt-0.5 uppercase">
            {record.facilityType || 'LOAN'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Borrower Dossier',
      key: 'borrower',
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm block">{record.borrowerName || 'N/A'}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <a
              href={`tel:${record.borrowerPhone}`}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              {record.borrowerPhone || 'No Phone'}
            </a>
            {record.borrowerNic && (
              <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                NIC: {record.borrowerNic}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Installment & Due Date',
      key: 'due',
      render: (_, record) => (
        <div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
            EMI #{record.installmentNumber}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Due {dayjs(record.dueDate).format('DD MMM YYYY')}
          </span>
        </div>
      ),
    },
    {
      title: 'Delinquency Aging',
      dataIndex: 'daysOverdue',
      key: 'daysOverdue',
      sorter: (a, b) => (a.daysOverdue || 0) - (b.daysOverdue || 0),
      render: (days) => {
        let color = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
        if (days > 30) {
          color = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse';
        } else if (days > 14) {
          color = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
        }
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
            <Clock className="w-3 h-3" />
            {days} Days Late
          </span>
        );
      },
    },
    {
      title: 'Overdue Amount',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      align: 'right',
      sorter: (a, b) => Number(a.overdueAmount || 0) - Number(b.overdueAmount || 0),
      render: (val) => (
        <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-sm">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Last Action',
      key: 'lastAction',
      render: (_, record) => (
        <div>
          {record.lastFollowUpDate ? (
            <div>
              <Tag color={record.lastFollowUpOutcome === 'PROMISED_TO_PAY' ? 'green' : 'orange'} className="text-[10px]">
                {record.lastFollowUpOutcome}
              </Tag>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {dayjs(record.lastFollowUpDate).format('DD/MM/YY')} ({record.followUpCount || 1} logs)
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No calls logged yet</span>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="small"
            type="primary"
            className="bg-amber-600 hover:bg-amber-500 text-xs font-semibold border-none flex items-center gap-1"
            onClick={() => handleOpenFollowUp(record)}
          >
            <PhoneCall className="w-3 h-3" />
            Log Call
          </Button>
          <Button
            size="small"
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs flex items-center gap-1 bg-white dark:bg-transparent"
            onClick={() => handleViewHistory(record)}
          >
            <Eye className="w-3 h-3" />
            History
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
                Delinquency & Arrears Recovery Desk
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchOverdues}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Sync Pipeline
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
            Total Overdue Book
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block mt-1">
            LKR {totalOverdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Across {overdues.length} delinquent installments
          </span>
        </Card>

        <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
            Critical Aging (&gt;30 Days)
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block mt-1">
            {criticalAccountsCount} Accounts
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Subject to legal demand letter</span>
        </Card>

        <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
            Promised Payments
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
            {promisedCount} Borrowers
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Commitment given this cycle</span>
        </Card>

        <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
            Recovery Efficiency
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block mt-1">
            {overdues.length > 0 ? Math.round((promisedCount / overdues.length) * 100) : 100}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Follow-up response rate</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              prefix={<Search className="w-4 h-4 text-slate-400" />}
              placeholder="Search by borrower name, phone, NIC, facility..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 rounded-xl w-full sm:w-80"
            />
            <Select
              value={agingFilter}
              onChange={setAgingFilter}
              className="w-40"
              options={[
                { value: 'ALL', label: 'All Aging Buckets' },
                { value: '1-14', label: '1–14 Days Late' },
                { value: '15-30', label: '15–30 Days Late' },
                { value: '30+', label: '30+ Days Critical' },
              ]}
            />
          </div>

          <span className="text-xs text-slate-600 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredOverdues.length}</strong> delinquent records
          </span>
        </div>

        <Table
          dataSource={filteredOverdues}
          columns={columns}
          rowKey="installmentId"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Record Follow-Up Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <PhoneCall className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span>Log Debtor Recovery Follow-up</span>
          </div>
        }
        open={followUpModalVisible}
        onCancel={() => setFollowUpModalVisible(false)}
        footer={null}
        width={560}
      >
        {selectedRecord && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedRecord.borrowerName}
                </span>
                <Tag color="error">{selectedRecord.daysOverdue} Days Late</Tag>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Facility: </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{selectedRecord.facilityNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Phone: </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedRecord.borrowerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Overdue EMI: </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    LKR {Number(selectedRecord.overdueAmount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Due Date: </span>
                  <span>{dayjs(selectedRecord.dueDate).format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>

            <Form form={followUpForm} layout="vertical" onFinish={handleRecordFollowUp}>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="contactMethod"
                  label={<span className="text-slate-700 dark:text-slate-300 font-medium">Contact Method</span>}
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { value: 'PHONE_CALL', label: 'Direct Phone Call' },
                      { value: 'SMS', label: 'SMS Reminder' },
                      { value: 'VISIT', label: 'Field Officer Site Visit' },
                      { value: 'EMAIL', label: 'Formal Email Demand' },
                      { value: 'LETTER', label: 'Registered Letter' },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="contactOutcome"
                  label={<span className="text-slate-700 dark:text-slate-300 font-medium">Borrower Response / Outcome</span>}
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { value: 'PROMISED_TO_PAY', label: 'Promised to Pay (PTP)' },
                      { value: 'PARTIAL_PAYMENT_MADE', label: 'Partial Deposit Made' },
                      { value: 'NO_RESPONSE', label: 'Unreachable / No Answer' },
                      { value: 'RESCHEDULED', label: 'Requested Rescheduling' },
                      { value: 'DISPUTED', label: 'Disputed Balance' },
                      { value: 'OTHER', label: 'Other Circumstance' },
                    ]}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="nextFollowUpDate"
                label={<span className="text-slate-700 dark:text-slate-300 font-medium">Next Callback / Action Date</span>}
              >
                <DatePicker className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg" disabledDate={(current) => current && current < dayjs().startOf('day')} />
              </Form.Item>

              <Form.Item
                name="notes"
                label={<span className="text-slate-700 dark:text-slate-300 font-medium">Conversation Notes & Commitments</span>}
                rules={[
                  { required: true, message: 'Please enter notes on borrower response' },
                  { min: 5, message: 'Notes must be at least 5 characters for meaningful records' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="e.g. Borrower confirmed salary credited on 15th, will transfer full EMI via BOC online..."
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg"
                />
              </Form.Item>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button onClick={() => setFollowUpModalVisible(false)} className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={followUpSubmitting}
                  className="bg-amber-600 hover:bg-amber-500 border-none font-semibold px-6 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Save Follow-up Entry
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Follow-Up History Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span>Recovery Log — {selectedRecord?.facilityNumber}</span>
          </div>
        }
        placement="right"
        width={480}
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Target Borrower</span>
              <span className="font-bold text-slate-900 dark:text-white text-base block mt-0.5">{selectedRecord.borrowerName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mt-1">Phone: {selectedRecord.borrowerPhone}</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block mt-1">
                Overdue: LKR {Number(selectedRecord.overdueAmount).toLocaleString()} ({selectedRecord.daysOverdue} days late)
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">
                Interaction Timeline
              </h3>
              {historyLoading ? (
                <div className="text-center py-8 text-slate-400 text-xs">Loading interaction history...</div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic">
                  No recovery follow-ups recorded yet for this installment.
                </div>
              ) : (
                <Timeline
                  items={historyList.map((item) => ({
                    color: item.contactOutcome === 'PROMISED_TO_PAY' ? 'green' : 'blue',
                    children: (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <Tag color="cyan" className="text-[10px]">
                            {item.contactMethod}
                          </Tag>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {dayjs(item.followUpDate).format('DD MMM YYYY')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 m-0 font-medium">{item.notes}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700/40">
                          <span>By: {item.recordedByOfficer || 'Officer'}</span>
                          {item.nextFollowUpDate && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Next: {dayjs(item.nextFollowUpDate).format('DD MMM')}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DelinquentAccountsDesk;
