import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Progress, Button, Spin, message, Alert, Tabs, Modal, Descriptions } from 'antd';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react';
import dayjs from 'dayjs';
import financeApi from '../../api/financeApi';
import repaymentApi from '../../api/repaymentApi';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';

const ApplicantRepaymentsPage = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [payments, setPayments] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeApi.getFacilities();
      if (res.success) {
        const list = res.data || [];
        setFacilities(list);
        if (list.length > 0) {
          setSelectedFacility(list[0]);
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const fetchScheduleAndPayments = useCallback(async (facilityId) => {
    if (!facilityId) return;
    setScheduleLoading(true);
    try {
      const [schedRes, payRes] = await Promise.allSettled([
        repaymentApi.getSchedule(facilityId),
        repaymentApi.getFacilityPayments(facilityId),
      ]);

      if (schedRes.status === 'fulfilled' && schedRes.value.success) {
        setSchedule(schedRes.value.data);
      } else {
        setSchedule(null);
      }

      if (payRes.status === 'fulfilled' && payRes.value.success) {
        setPayments(payRes.value.data || []);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFacility?.id) {
      fetchScheduleAndPayments(selectedFacility.id);
    }
  }, [selectedFacility?.id, fetchScheduleAndPayments]);

  const handleOpenReceipt = (payment) => {
    setSelectedReceipt(payment);
    setReceiptModalVisible(true);
  };

  const scheduleColumns = [
    {
      title: '#',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      width: 50,
      render: (num) => <span className="font-mono text-xs font-bold text-slate-300">{num}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => (
        <div>
          <span className="text-slate-200 font-medium text-xs block">
            {dayjs(date).format('DD MMM YYYY')}
          </span>
          {record.status === 'OVERDUE' && (
            <span className="text-[10px] text-rose-400 font-semibold">
              Payment overdue
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Principal',
      dataIndex: 'principalPortion',
      key: 'principalPortion',
      align: 'right',
      render: (val) => (
        <span className="text-slate-300 text-xs font-mono">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Interest',
      dataIndex: 'interestPortion',
      key: 'interestPortion',
      align: 'right',
      render: (val) => (
        <span className="text-slate-400 text-xs font-mono">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Total EMI',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (val) => (
        <span className="text-slate-100 font-bold text-xs font-mono">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Amount Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right',
      render: (val, record) => (
        <div>
          <span className={`text-xs font-mono font-medium ${val > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
            LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {record.paidDate && (
            <span className="text-[10px] text-slate-400 block">
              on {dayjs(record.paidDate).format('DD MMM YYYY')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  const paymentColumns = [
    {
      title: 'Receipt / Ref #',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      render: (text) => <span className="font-mono text-xs font-bold text-blue-400">{text || 'N/A'}</span>,
    },
    {
      title: 'Settled Installment',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      render: (num) => <span className="text-xs text-slate-200">EMI #{num}</span>,
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => <span className="text-xs text-slate-300">{dayjs(date).format('DD MMM YYYY')}</span>,
    },
    {
      title: 'Payment Channel',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (m) => <Tag color="cyan" className="text-[10px]">{m}</Tag>,
    },
    {
      title: 'Amount Credited',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-emerald-400 font-bold text-xs">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
          className="border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
          onClick={() => handleOpenReceipt(record)}
        >
          <Receipt className="w-3 h-3" />
          Receipt
        </Button>
      ),
    },
  ];

  const nextDueInstallment = schedule?.installments?.find(
    (i) => i.status === 'PENDING' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID'
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight m-0">
            My Loan Repayments & Dues
          </h1>
          <p className="text-xs text-slate-400 m-0">
            EP04 — US18: Real-time Installment Schedules & Payment Transaction Receipts
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Spin size="large" />
          <span className="text-slate-400 text-sm block mt-3">Loading active facilities...</span>
        </div>
      ) : facilities.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-center py-12 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 mb-3">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Active Facilities Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once your loan or vehicle leasing application is approved and disbursed, your active repayment schedule will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Facility Selector (if multiple) */}
          {facilities.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {facilities.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedFacility?.id === fac.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {fac.facilityNumber} ({fac.type})
                </button>
              ))}
            </div>
          )}

          {/* Active Facility Hero Card */}
          {selectedFacility && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left 2 Cols: Facility Overview & Progress */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-bold tracking-wider">
                      {selectedFacility.facilityNumber}
                    </span>
                    <h2 className="text-lg font-bold text-white m-0">
                      {selectedFacility.type === 'VEHICLE_LEASE' ? 'Vehicle Lease Facility' : 'Personal Loan Facility'}
                    </h2>
                  </div>
                  <Tag color="success" className="px-3 py-1 font-semibold uppercase text-xs">
                    {selectedFacility.status}
                  </Tag>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Sanctioned Amount</span>
                    <span className="text-base font-bold text-white font-mono">
                      LKR {Number(selectedFacility.principalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Monthly EMI</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      LKR {Number(selectedFacility.installmentAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Total Paid</span>
                    <span className="text-base font-bold text-blue-400 font-mono">
                      LKR {Number(selectedFacility.totalPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Outstanding</span>
                    <span className="text-base font-bold text-slate-200 font-mono">
                      LKR {Number(selectedFacility.outstandingBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>
                      Repayment Completion: <strong className="text-white">{schedule?.paidInstallmentsCount || 0}</strong> of{' '}
                      <strong>{schedule?.totalInstallments || selectedFacility.tenureMonths || 12}</strong> EMIs settled
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {Math.round(
                        ((schedule?.paidInstallmentsCount || 0) /
                          (schedule?.totalInstallments || selectedFacility.tenureMonths || 1)) *
                          100
                      )}
                      % Paid
                    </span>
                  </div>
                  <Progress
                    percent={Math.round(
                      ((schedule?.paidInstallmentsCount || 0) /
                        (schedule?.totalInstallments || selectedFacility.tenureMonths || 1)) *
                        100
                    )}
                    strokeColor={{
                      '0%': '#3b82f6',
                      '100%': '#10b981',
                    }}
                    trailColor="#334155"
                  />
                </div>
              </Card>

              {/* Right Col: Next Due Date Alert Card */}
              <Card className="bg-slate-900 border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Next Payment Due
                  </span>
                  {nextDueInstallment ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={`w-5 h-5 ${nextDueInstallment.status === 'OVERDUE' ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span className={`text-xl font-bold font-mono ${nextDueInstallment.status === 'OVERDUE' ? 'text-rose-400' : 'text-white'}`}>
                          LKR {Number(nextDueInstallment.remainingAmount || nextDueInstallment.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 m-0">
                        Due by <strong className="text-white">{dayjs(nextDueInstallment.dueDate).format('DD MMMM YYYY')}</strong> (EMI #{nextDueInstallment.installmentNumber})
                      </p>
                      {nextDueInstallment.status === 'OVERDUE' && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Account overdue. Please deposit immediately to avoid penalty charges.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                      <span className="text-sm font-bold text-white block">All Installments Settled</span>
                      <span className="text-xs text-slate-400">Congratulations, your facility is fully paid!</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Direct deposit bank: <strong>Bank of Ceylon (BOC)</strong></span>
                  <br />
                  <span>A/C: <strong>728100291</strong> (Smart Line Corporate)</span>
                </div>
              </Card>
            </div>
          )}

          {/* Tabbed View: Installment Schedule vs Payment Receipts */}
          <Card className="bg-slate-900 border-slate-800 rounded-2xl">
            <Tabs
              defaultActiveKey="schedule"
              items={[
                {
                  key: 'schedule',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs">
                      <Calendar className="w-4 h-4" />
                      Amortization Schedule
                    </span>
                  ),
                  children: scheduleLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Loading schedule...</div>
                  ) : schedule ? (
                    <Table
                      dataSource={schedule.installments || []}
                      columns={scheduleColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      className="dark-table"
                    />
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs italic">
                      No schedule generated yet. Contact your assigned Loan Officer.
                    </div>
                  ),
                },
                {
                  key: 'receipts',
                  label: (
                    <span className="flex items-center gap-1.5 font-semibold text-xs">
                      <Receipt className="w-4 h-4" />
                      Payment History & Receipts ({payments.length})
                    </span>
                  ),
                  children: scheduleLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">Loading payment records...</div>
                  ) : payments.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs italic">
                      No payments recorded yet for this facility.
                    </div>
                  ) : (
                    <Table
                      dataSource={payments}
                      columns={paymentColumns}
                      rowKey="id"
                      pagination={{ pageSize: 8 }}
                      size="small"
                      className="dark-table"
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-100">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Official Payment Receipt</span>
          </div>
        }
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptModalVisible(false)} className="border-slate-700 text-slate-300">
            Close
          </Button>,
        ]}
        width={480}
        className="dark-modal"
      >
        {selectedReceipt && (
          <div className="space-y-4 pt-2">
            <div className="text-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block">Payment Confirmed</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                LKR {Number(selectedReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-300 block mt-1">
                Settled Installment #{selectedReceipt.installmentNumber}
              </span>
            </div>

            <Descriptions column={1} size="small" bordered className="dark-descriptions">
              <Descriptions.Item label="Receipt / Ref #">
                <span className="font-mono text-blue-400 font-bold">{selectedReceipt.referenceNumber}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Facility #">
                <span className="font-mono text-slate-300">{selectedReceipt.facilityNumber}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Date">
                {dayjs(selectedReceipt.paymentDate).format('DD MMMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Channel">
                <Tag color="cyan">{selectedReceipt.paymentMethod}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Processed By">
                {selectedReceipt.recordedByOfficer || 'Finance Desk'}
              </Descriptions.Item>
              <Descriptions.Item label="Remarks">
                {selectedReceipt.remarks || 'Standard installment settlement'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicantRepaymentsPage;
