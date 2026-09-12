import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, Upload, message, Alert, Tag } from 'antd';
import { UploadCloud, FileText, CheckCircle, AlertCircle, DollarSign, Calendar, Landmark } from 'lucide-react';
import dayjs from 'dayjs';
import repaymentApi from '../../api/repaymentApi';

const { Option } = Select;

const PaymentProofUploadModal = ({ visible, installment, facility, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && installment) {
      const remaining = installment.remainingAmount != null
        ? installment.remainingAmount
        : ((installment.totalAmount || 0) - (installment.paidAmount || 0));

      form.setFieldsValue({
        amount: remaining > 0 ? remaining : installment.totalAmount,
        paymentDate: dayjs(),
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        remarks: '',
      });
      setFileList([]);
    }
  }, [visible, installment, form]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Only keep the most recent file
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = (file) => {
    const isAllowedType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type);
    if (!isAllowedType) {
      message.error('You can only upload JPG/PNG/WebP image or PDF document!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent automatic upload by AntD
  };

  const handleSubmit = async (values) => {
    if (!fileList || fileList.length === 0) {
      message.error('Please attach your payment receipt or transfer slip!');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      const rawFile = fileList[0].originFileObj || fileList[0];
      formData.append('file', rawFile);
      formData.append('amount', values.amount);
      if (values.paymentDate) {
        formData.append('paymentDate', values.paymentDate.format('YYYY-MM-DD'));
      }
      formData.append('paymentMethod', values.paymentMethod);
      formData.append('referenceNumber', values.referenceNumber.trim());
      if (values.remarks) {
        formData.append('remarks', values.remarks.trim());
      }

      await repaymentApi.uploadPaymentProof(installment.id, formData);
      message.success('Payment proof uploaded successfully! Our Finance team will verify it shortly.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to upload payment proof. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = installment
    ? (installment.remainingAmount != null
        ? installment.remainingAmount
        : ((installment.totalAmount || 0) - (installment.paidAmount || 0)))
    : 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base">Submit Payment Proof</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Upload transfer slip or deposit receipt for officer verification
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={580}
      destroyOnClose
    >
      {installment && (
        <div className="space-y-4 pt-2">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Installment #{installment.installmentNumber}
              </span>
              <Tag color={installment.status === 'OVERDUE' ? 'error' : 'processing'}>
                {installment.status}
              </Tag>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Facility Ref</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {facility?.facilityNumber || installment.facilityNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Due Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {installment.dueDate ? dayjs(installment.dueDate).format('DD MMM YYYY') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Remaining Due</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  LKR {Number(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection notice if previously rejected */}
          {installment.latestProofRejectionReason && (
            <Alert
              type="warning"
              showIcon
              message="Previous Submission Needs Attention"
              description={
                <div className="text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-300">Officer Note: </span>
                  <span className="text-slate-700 dark:text-slate-300">{installment.latestProofRejectionReason}</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Please upload a clearer slip or verify your transaction reference before re-submitting.
                  </p>
                </div>
              }
              className="rounded-xl border-amber-200 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20"
            />
          )}

          {/* Form */}
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
            {/* File Upload Dragger */}
            <Form.Item
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Slip / Transfer Receipt Document</span>}
              required
              className="mb-4"
            >
              <Upload.Dragger
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-4"
              >
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 m-0">
                    Click or drag payment slip here to upload
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-0">
                    Supports JPG, PNG, WebP or PDF (Max 5MB)
                  </p>
                </div>
              </Upload.Dragger>
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="amount"
                label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount Paid (LKR)</span>}
                rules={[
                  { required: true, message: 'Please enter payment amount' },
                  { type: 'number', min: 1, message: 'Amount must be greater than zero' },
                  {
                    validator: (_, value) => {
                      if (value && remaining > 0 && value > remaining) {
                        return Promise.reject(new Error(`Amount cannot exceed remaining balance of LKR ${remaining.toLocaleString()}`));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Enter amount"
                />
              </Form.Item>

              <Form.Item
                name="paymentDate"
                label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deposit / Transfer Date</span>}
                rules={[{ required: true, message: 'Select payment date' }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" disabledDate={(curr) => curr && curr > dayjs().endOf('day')} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="paymentMethod"
                label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Channel</span>}
                rules={[{ required: true, message: 'Select payment method' }]}
              >
                <Select placeholder="Select method">
                  <Option value="BANK_TRANSFER">Bank Transfer / CDM Deposit</Option>
                  <Option value="CASH_DEPOSIT">Branch Counter Cash Deposit</Option>
                  <Option value="ONLINE">Online Banking / Mobile App</Option>
                  <Option value="CHEQUE">Bank Cheque</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="referenceNumber"
                label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slip / Bank Ref #</span>}
                rules={[{ required: true, message: 'Enter slip or txn reference number' }]}
              >
                <Input placeholder="e.g. TXN-89421 or Slip Number" />
              </Form.Item>
            </div>

            <Form.Item
              name="remarks"
              label={<span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Borrower Notes (Optional)</span>}
            >
              <Input.TextArea rows={2} placeholder="Any notes regarding branch, deposit time, or bank account..." />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="bg-blue-600 hover:bg-blue-500 font-semibold border-none"
              >
                Submit for Officer Verification
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default PaymentProofUploadModal;
