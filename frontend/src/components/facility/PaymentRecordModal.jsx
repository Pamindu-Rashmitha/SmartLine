import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, Alert, Descriptions, Tag } from 'antd';
import { DollarSign, CheckCircle, CreditCard, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import repaymentApi from '../../api/repaymentApi';

const PaymentRecordModal = ({ visible, installment, facility, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && installment) {
      const remaining = installment.remainingAmount != null ? installment.remainingAmount :
        ((installment.totalAmount || 0) - (installment.paidAmount || 0));

      form.setFieldsValue({
        amount: remaining > 0 ? remaining : installment.totalAmount,
        paymentDate: dayjs(),
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: `SLIPS-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        remarks: `Installment #${installment.installmentNumber} payment receipt`,
      });
    }
  }, [visible, installment, form]);

  const handleSubmit = async (values) => {
    if (!installment) return;
    setSubmitting(true);
    try {
      const payload = {
        amount: values.amount,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        paymentMethod: values.paymentMethod,
        referenceNumber: values.referenceNumber,
        remarks: values.remarks,
      };

      await repaymentApi.recordPayment(installment.id, payload);
      message.success(`Payment of LKR ${Number(values.amount).toLocaleString()} recorded successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = installment ?
    (installment.remainingAmount != null ? installment.remainingAmount : ((installment.totalAmount || 0) - (installment.paidAmount || 0))) : 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-100">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Record Installment Payment</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={560}
      className="dark-modal"
    >
      {installment && (
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Installment #{installment.installmentNumber}
              </span>
              <Tag color={installment.status === 'OVERDUE' ? 'error' : 'processing'}>
                {installment.status}
              </Tag>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Facility Ref</span>
                <span className="font-mono text-blue-400 font-medium">
                  {facility?.facilityNumber || installment.facilityNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Due Date</span>
                <span className="text-slate-200 font-medium">
                  {dayjs(installment.dueDate).format('DD MMM YYYY')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Total Installment</span>
                <span className="text-slate-200 font-medium">
                  LKR {Number(installment.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Outstanding Balance</span>
                <span className="text-emerald-400 font-bold">
                  LKR {Number(remaining).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="amount"
              label={<span className="text-slate-300 font-medium">Payment Amount (LKR)</span>}
              rules={[
                { required: true, message: 'Please enter payment amount' },
                {
                  validator: (_, value) => {
                    if (value <= 0) return Promise.reject(new Error('Amount must be greater than zero'));
                    if (value > remaining) {
                      return Promise.reject(new Error(`Cannot exceed remaining balance of LKR ${remaining.toLocaleString()}`));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                className="w-full h-10 bg-slate-900 border-slate-700 text-slate-100 rounded-lg text-base"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                min={0.01}
                max={remaining}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="paymentDate"
                label={<span className="text-slate-300 font-medium">Payment Date</span>}
                rules={[{ required: true, message: 'Payment date is required' }]}
              >
                <DatePicker className="w-full h-10 bg-slate-900 border-slate-700 text-slate-100 rounded-lg" />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label={<span className="text-slate-300 font-medium">Payment Channel</span>}
                rules={[{ required: true, message: 'Payment method is required' }]}
              >
                <Select
                  className="w-full h-10 rounded-lg"
                  options={[
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer / SLIPS' },
                    { value: 'CASH', label: 'Cash at Counter' },
                    { value: 'CHEQUE', label: 'Cheque Deposit' },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="referenceNumber"
              label={<span className="text-slate-300 font-medium">Transaction Reference / Receipt #</span>}
              rules={[{ required: true, message: 'Reference number is required' }]}
            >
              <Input
                placeholder="e.g. SLIPS-TXN-881920 or Receipt #0921"
                className="h-10 bg-slate-900 border-slate-700 text-slate-100 rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="remarks"
              label={<span className="text-slate-300 font-medium">Finance Officer Remarks</span>}
            >
              <Input.TextArea
                rows={2}
                placeholder="Add audit notes or remarks..."
                className="bg-slate-900 border-slate-700 text-slate-100 rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <Button onClick={onClose} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 border-none font-semibold px-6 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Payment Receipt
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default PaymentRecordModal;
