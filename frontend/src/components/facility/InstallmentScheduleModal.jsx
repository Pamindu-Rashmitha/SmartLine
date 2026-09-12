import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, Tag, Spin, message, Alert, Form, Select, DatePicker, Card, Progress } from 'antd';
import { Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, Play, RefreshCw, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import repaymentApi from '../../api/repaymentApi';
import StatusBadge from '../common/StatusBadge';
import PaymentRecordModal from './PaymentRecordModal';
import { useAuth } from '../../contexts/AuthContext';

const InstallmentScheduleModal = ({ visible, facility, onClose, onRefreshFacility }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasNoSchedule, setHasNoSchedule] = useState(false);
  const [generateForm] = Form.useForm();

  // Payment recording modal state
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const fetchSchedule = useCallback(async () => {
    if (!facility?.id) return;
    setLoading(true);
    setHasNoSchedule(false);
    try {
      const res = await repaymentApi.getSchedule(facility.id);
      if (res.success && res.data) {
        setSchedule(res.data);
      } else {
        setHasNoSchedule(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setHasNoSchedule(true);
        setSchedule(null);
      } else {
        message.error(err.response?.data?.message || 'Failed to fetch installment schedule');
      }
    } finally {
      setLoading(false);
    }
  }, [facility?.id]);

  useEffect(() => {
    if (visible && facility?.id) {
      fetchSchedule();
    } else {
      setSchedule(null);
      setHasNoSchedule(false);
    }
  }, [visible, facility?.id, fetchSchedule]);

  const handleGenerateSchedule = async (values) => {
    setGenerating(true);
    try {
      const payload = {
        frequency: values.frequency || 'MONTHLY',
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
      };
      const res = await repaymentApi.generateSchedule(facility.id, payload);
      message.success('Installment schedule generated successfully!');
      setSchedule(res.data);
      setHasNoSchedule(false);
      if (onRefreshFacility) onRefreshFacility();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPayment = (record) => {
    setSelectedInstallment(record);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    fetchSchedule();
    if (onRefreshFacility) onRefreshFacility();
  };

  const isFinanceOrAdmin = user?.role === 'FINANCE_OFFICER' || user?.role === 'ADMIN';

  const columns = [
    {
      title: '#',
      dataIndex: 'installmentNumber',
      key: 'installmentNumber',
      width: 50,
      render: (num) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{num}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => (
        <div>
          <span className="text-slate-900 dark:text-slate-200 font-medium text-xs block">
            {dayjs(date).format('DD MMM YYYY')}
          </span>
          {record.daysOverdue > 0 && record.status === 'OVERDUE' && (
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
              {record.daysOverdue} days late
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Principal Portion',
      dataIndex: 'principalPortion',
      key: 'principalPortion',
      align: 'right',
      render: (val) => (
        <span className="text-slate-700 dark:text-slate-300 text-xs font-mono">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Interest Portion',
      dataIndex: 'interestPortion',
      key: 'interestPortion',
      align: 'right',
      render: (val) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
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
        <span className="text-slate-900 dark:text-slate-100 font-bold text-xs font-mono">
          LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right',
      render: (val, record) => (
        <div>
          <span className={`text-xs font-mono font-medium ${val > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
            LKR {Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {record.paidDate && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              on {dayjs(record.paidDate).format('DD/MM/YY')}
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
    ...(isFinanceOrAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 110,
            render: (_, record) =>
              record.status !== 'PAID' ? (
                <Button
                  size="small"
                  type="primary"
                  className="bg-emerald-600 hover:bg-emerald-500 text-xs font-medium border-none"
                  onClick={() => handleOpenPayment(record)}
                >
                  Pay EMI
                </Button>
              ) : (
                <Tag color="success" className="text-xs">
                  Settled
                </Tag>
              ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span>Installment Schedule — {facility?.facilityNumber}</span>
            </div>
            {facility?.status && (
              <Tag color={facility.status === 'ACTIVE' ? 'processing' : 'default'} className="uppercase">
                {facility.status}
              </Tag>
            )}
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={960}
      >
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Spin size="large" />
            <span className="text-slate-500 dark:text-slate-400 text-sm">Loading amortization schedule...</span>
          </div>
        ) : hasNoSchedule ? (
          <div className="py-8 px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Schedule Generated Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                This active facility has not had its installment schedule initialized. Generate the straight-line
                amortization schedule based on the sanctioned term of {facility?.tenureMonths || 12} months.
              </p>

              {isFinanceOrAdmin ? (
                <Form
                  form={generateForm}
                  layout="vertical"
                  onFinish={handleGenerateSchedule}
                  initialValues={{
                    frequency: 'MONTHLY',
                    startDate: dayjs().add(1, 'month'),
                  }}
                  className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-left"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="frequency"
                      label={<span className="text-slate-700 dark:text-slate-300 font-medium">Payment Frequency</span>}
                    >
                      <Select
                        className="w-full"
                        options={[
                          { value: 'MONTHLY', label: 'Monthly' },
                          { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
                          { value: 'WEEKLY', label: 'Weekly' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="startDate"
                      label={<span className="text-slate-700 dark:text-slate-300 font-medium">First Due Date</span>}
                    >
                      <DatePicker className="w-full" />
                    </Form.Item>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={generating}
                    className="w-full bg-blue-600 hover:bg-blue-500 h-10 font-semibold border-none flex items-center justify-center gap-2 mt-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Generate Amortization Schedule
                  </Button>
                </Form>
              ) : (
                <Alert
                  message="Schedule generation must be performed by a Finance Officer."
                  type="info"
                  showIcon
                  className="bg-blue-50/50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                />
              )}
            </div>
          </div>
        ) : schedule ? (
          <div className="space-y-4 pt-2">
            {/* Metric KPI cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                  Progress
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
                  {schedule.paidInstallmentsCount || 0} / {schedule.totalInstallments || 0} Paid
                </span>
                <Progress
                  percent={Math.round(
                    ((schedule.paidInstallmentsCount || 0) / (schedule.totalInstallments || 1)) * 100
                  )}
                  size="small"
                  strokeColor="#10b981"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                  Total Paid
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  LKR {Number(schedule.totalPaidAmount || 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total collected</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                  Outstanding Balance
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                  LKR {Number(schedule.totalRemainingAmount || 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Book value</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
                  Overdue EMIs
                </span>
                <span
                  className={`text-lg font-bold block mt-0.5 ${
                    (schedule.overdueInstallmentsCount || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {schedule.overdueInstallmentsCount || 0} Overdue
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(schedule.overdueInstallmentsCount || 0) > 0 ? 'Action required' : 'Account current'}
                </span>
              </div>
            </div>

            {/* Installment Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <Table
                dataSource={schedule.installments || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 380 }}
              />
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Embedded Payment Record Modal */}
      <PaymentRecordModal
        visible={paymentModalVisible}
        installment={selectedInstallment}
        facility={facility}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedInstallment(null);
        }}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default InstallmentScheduleModal;
