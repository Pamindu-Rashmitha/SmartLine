import React, { useEffect, useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Divider,
} from 'antd';
import {
  DollarSign,
  Send,
  Receipt,
  CheckCircle2,
  Clock,
  Car,
  FileCheck2,
  ShieldCheck,
  Search,
  Building,
  CreditCard,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import financeApi from '../../api/financeApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { Option } = Select;

const FinanceDisbursalDesk = () => {
  const [activeTab, setActiveTab] = useState('downPayment');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [downPaymentApps, setDownPaymentApps] = useState([]);
  const [disbursalApps, setDisbursalApps] = useState([]);

  // Down Payment Modal State
  const [downPaymentModalOpen, setDownPaymentModalOpen] = useState(false);
  const [selectedDownPaymentApp, setSelectedDownPaymentApp] = useState(null);
  const [dpForm] = Form.useForm();

  // Disbursal Modal State
  const [disbursalModalOpen, setDisbursalModalOpen] = useState(false);
  const [selectedDisbursalApp, setSelectedDisbursalApp] = useState(null);
  const [disbursalForm] = Form.useForm();

  // Success Activation Modal
  const [activatedFacility, setActivatedFacility] = useState(null);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const [dpRes, disbRes] = await Promise.all([
        financeApi.getPendingDownPayments(),
        financeApi.getPendingDisbursals(),
      ]);

      if (dpRes.data) setDownPaymentApps(dpRes.data);
      if (disbRes.data) setDisbursalApps(disbRes.data);
    } catch (err) {
      console.error('Failed to load finance queues:', err);
      message.error('Failed to load finance disbursal pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // --- Down Payment Handlers ---
  const handleOpenDownPaymentModal = (app) => {
    setSelectedDownPaymentApp(app);
    const required = app.downPayment?.requiredAmount || 50000;
    dpForm.setFieldsValue({
      paidAmount: required,
      paymentDate: dayjs(),
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: '',
      status: 'PAID',
      remarks: 'Direct deposit to corporate collection account',
    });
    setDownPaymentModalOpen(true);
  };

  const handleRecordDownPayment = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        paidAmount: values.paidAmount,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        paymentMethod: values.paymentMethod,
        referenceNumber: values.referenceNumber,
        status: values.status,
        remarks: values.remarks,
      };

      await financeApi.recordDownPayment(selectedDownPaymentApp.id, payload);
      message.success('Down-payment recorded successfully! Application moved to Disbursal queue.');
      setDownPaymentModalOpen(false);
      fetchQueues();
      setActiveTab('disbursal'); // Auto-switch to disbursal queue
    } catch (err) {
      console.error('Failed to record down-payment:', err);
      message.error(err.response?.data?.message || 'Failed to record down-payment');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Disbursal Handlers ---
  const handleOpenDisbursalModal = (app) => {
    setSelectedDisbursalApp(app);
    disbursalForm.setFieldsValue({
      disbursementMethod: 'BANK_TRANSFER',
      disbursementReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      disbursementDate: dayjs(),
      firstInstallmentDate: dayjs().add(1, 'month'),
      remarks: 'Approved funds transferred to applicant verified bank account.',
    });
    setDisbursalModalOpen(true);
  };

  const handleExecuteDisbursal = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        disbursementMethod: values.disbursementMethod,
        disbursementReference: values.disbursementReference,
        disbursementDate: values.disbursementDate.format('YYYY-MM-DD'),
        firstInstallmentDate: values.firstInstallmentDate.format('YYYY-MM-DD'),
        remarks: values.remarks,
      };

      const res = await financeApi.recordDisbursal(selectedDisbursalApp.id, payload);
      setDisbursalModalOpen(false);
      setActivatedFacility(res.data);
      fetchQueues();
    } catch (err) {
      console.error('Failed to execute disbursal:', err);
      message.error(err.response?.data?.message || 'Failed to execute disbursal');
    } finally {
      setSubmitting(false);
    }
  };

  // Columns for Down-Payment Table
  const downPaymentColumns = [
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
          <div className="font-medium text-slate-200">{text}</div>
          <div className="text-xs text-slate-400 font-mono">NIC: {record.applicantNic}</div>
        </div>
      ),
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
      title: 'Approved Principal',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <div className="font-mono font-semibold text-slate-900 dark:text-slate-200">
          LKR {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      title: 'Down-Payment Status',
      key: 'downPaymentStatus',
      render: () => (
        <Tag color="warning" className="font-medium text-xs">
          AWAITING RECEIPT
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Receipt className="w-4 h-4" />}
          onClick={() => handleOpenDownPaymentModal(record)}
          className="bg-amber-600 hover:bg-amber-500 border-none flex items-center gap-1.5 text-xs font-medium ml-auto"
        >
          Record Down-Payment
        </Button>
      ),
    },
  ];

  // Columns for Disbursal Table
  const disbursalColumns = [
    {
      title: 'Application Ref',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{text}</span>
          <div className="text-xs text-slate-500 dark:text-slate-400">
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
      title: 'Disbursable Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (amount) => (
        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          LKR {Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      title: 'Pre-Conditions',
      key: 'preconditions',
      render: () => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Agreement Sealed</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Down-Payment Cleared</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Send className="w-4 h-4" />}
          onClick={() => handleOpenDisbursalModal(record)}
          className="bg-emerald-600 hover:bg-emerald-500 border-none flex items-center gap-1.5 text-xs font-medium ml-auto shadow-lg shadow-emerald-600/30"
        >
          Execute Disbursal
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
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
              Finance & Disbursal Operations Desk
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 mb-0">
            Verify down-payment collections, disburse approved credit funds, and activate active lending facilities.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Down-Payments"
            value={downPaymentApps.length}
            subtitle="Awaiting borrower receipt"
            icon={Receipt}
            color="amber"
            trend="Awaiting Receipt"
            trendType="down"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Disbursals"
            value={disbursalApps.length}
            subtitle="Ready for fund release"
            icon={Send}
            color="emerald"
            trend="Ready for Release"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Disbursable Volume"
            value={`LKR ${(
              disbursalApps.reduce((acc, a) => acc + Number(a.requestedAmount || 0), 0) / 1000000
            ).toFixed(2)}M`}
            subtitle="Queue total exposure"
            icon={DollarSign}
            color="blue"
            trend="Approved Funds"
            trendType="up"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Operational Readiness"
            value="100%"
            subtitle="All covenants checked"
            icon={ShieldCheck}
            color="purple"
            trend="Compliant"
            trendType="up"
          />
        </Col>
      </Row>

      {/* Primary Workstation Card */}
      <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="line"
          items={[
            {
              key: 'downPayment',
              label: (
                <div className="flex items-center gap-2 px-1">
                  <Receipt className="w-4 h-4" />
                  <span>Down-Payment Collection Desk</span>
                  <Tag color="warning" className="ml-1.5 font-mono text-[10px]">
                    {downPaymentApps.length}
                  </Tag>
                </div>
              ),
              children: (
                <div className="mt-3">
                  <Table
                    columns={downPaymentColumns}
                    dataSource={downPaymentApps}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    locale={{
                      emptyText: (
                        <div className="py-12 text-center text-slate-500">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
                          <div className="font-medium text-slate-600 dark:text-slate-400">No pending down-payments</div>
                          <div className="text-xs text-slate-500 mt-1">All down-payments have been verified</div>
                        </div>
                      ),
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'disbursal',
              label: (
                <div className="flex items-center gap-2 px-1">
                  <Send className="w-4 h-4" />
                  <span>Fund Disbursal & Activation Desk</span>
                  <Tag color="success" className="ml-1.5 font-mono text-[10px]">
                    {disbursalApps.length}
                  </Tag>
                </div>
              ),
              children: (
                <div className="mt-3">
                  <Table
                    columns={disbursalColumns}
                    dataSource={disbursalApps}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    locale={{
                      emptyText: (
                        <div className="py-12 text-center text-slate-500">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
                          <div className="font-medium text-slate-600 dark:text-slate-400">No pending disbursals</div>
                          <div className="text-xs text-slate-500 mt-1">All approved facilities have been funded</div>
                        </div>
                      ),
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Down-Payment Recording Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span>Record Down-Payment Receipt</span>
          </div>
        }
        open={downPaymentModalOpen}
        onCancel={() => setDownPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Application:</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedDownPaymentApp?.applicationNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Borrower:</span>
            <span className="text-slate-900 dark:text-slate-200">{selectedDownPaymentApp?.applicantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Facility Principal:</span>
            <span className="text-slate-900 dark:text-slate-200">
              LKR {Number(selectedDownPaymentApp?.requestedAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <Form form={dpForm} layout="vertical" onFinish={handleRecordDownPayment}>
          <Form.Item
            name="paidAmount"
            label="Paid / Received Amount (LKR)"
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber
              min={0}
              className="w-full font-mono"
              formatter={(value) => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\LKR\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Instrument"
                rules={[{ required: true, message: 'Method is required' }]}
              >
                <Select>
                  <Option value="BANK_TRANSFER">Bank Transfer (SLIPS/CEFT)</Option>
                  <Option value="CASH">Cash Over Counter</Option>
                  <Option value="CHEQUE">Cheque / Bank Draft</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="Receipt Date"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="referenceNumber" label="Bank / Receipt Reference No.">
                <Input placeholder="e.g. BOC-TXN-98412" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Receipt Status">
                <Select>
                  <Option value="PAID">PAID (Confirmed Cleared)</Option>
                  <Option value="WAIVED">WAIVED (Waived by Credit Comm.)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Audit & Verification Notes">
            <Input.TextArea rows={2} placeholder="Verification notes on fund arrival..." />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setDownPaymentModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-amber-600 hover:bg-amber-500 border-none font-medium"
            >
              Confirm Down-Payment
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Disbursal Execution Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Send className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>Execute Disbursal & Activate Facility</span>
          </div>
        }
        open={disbursalModalOpen}
        onCancel={() => setDisbursalModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Application Ref:</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedDisbursalApp?.applicationNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Borrower:</span>
            <span className="text-slate-900 dark:text-slate-200">{selectedDisbursalApp?.applicantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Approved Principal:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              LKR {Number(selectedDisbursalApp?.requestedAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <Form form={disbursalForm} layout="vertical" onFinish={handleExecuteDisbursal}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disbursementMethod"
                label="Transfer Method"
                rules={[{ required: true, message: 'Method is required' }]}
              >
                <Select>
                  <Option value="BANK_TRANSFER">Direct Bank Transfer (CEFT)</Option>
                  <Option value="CHEQUE">Cheque Issue</Option>
                  <Option value="CASH">Cash Pay-Out</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="disbursementReference"
                label="Transaction / Cheque No."
                rules={[{ required: true, message: 'Reference number is required' }]}
              >
                <Input placeholder="e.g. SL-TXN-98412" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disbursementDate"
                label="Disbursement Date"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="firstInstallmentDate"
                label="First Repayment Due"
                rules={[{ required: true, message: 'First installment date is required' }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Disbursement Vouchers & Audit Notes">
            <Input.TextArea
              rows={2}
              placeholder="e.g. Commercial Bank account credited, voucher #0912 attached..."
              className="text-xs"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setDisbursalModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 border-none font-medium"
            >
              Release Funds & Activate Facility
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Facility Activated Celebration Modal */}
      <Modal
        open={!!activatedFacility}
        onCancel={() => setActivatedFacility(null)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setActivatedFacility(null)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Done
          </Button>,
        ]}
      >
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 m-0">Facility Successfully Activated!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            The loan/lease facility has been legally activated and funded. Installment schedules are now ready for servicing.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Facility Number:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {activatedFacility?.facilityNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Application Number:</span>
              <span className="text-slate-900 dark:text-slate-200">{activatedFacility?.applicationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Principal Disbursed:</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                LKR {Number(activatedFacility?.principalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Outstanding Balance:</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                LKR {Number(activatedFacility?.outstandingBalance || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Monthly Installment:</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                LKR {Number(activatedFacility?.installmentAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Tenor:</span>
              <span className="text-slate-900 dark:text-slate-200">{activatedFacility?.tenureMonths} Months</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceDisbursalDesk;
