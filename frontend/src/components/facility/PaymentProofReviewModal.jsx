import React, { useState } from 'react';
import { Modal, Button, Tag, Input, Form, message, Alert, Tooltip, Popconfirm, Divider } from 'antd';
import {
  FileCheck,
  FileX,
  Download,
  ExternalLink,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Eye,
} from 'lucide-react';
import dayjs from 'dayjs';
import repaymentApi from '../../api/repaymentApi';

const PaymentProofReviewModal = ({ visible, proof, onClose, onSuccess }) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!proof) return null;

  const isImage = proof.slipFileType?.startsWith('image/') ||
    proof.slipFileName?.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = proof.slipFileType === 'application/pdf' ||
    proof.slipFileName?.match(/\.pdf$/i);
  const slipDownloadUrl = repaymentApi.getSlipUrl(proof.id);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await repaymentApi.approveProof(proof.id);
      message.success(`Payment proof approved! Installment #${proof.installmentNumber} settled.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to approve payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Please enter a rejection reason to inform the borrower');
      return;
    }
    setSubmitting(true);
    try {
      await repaymentApi.rejectProof(proof.id, { rejectionReason: rejectReason.trim() });
      message.success('Payment proof rejected. Borrower notified to re-upload.');
      setRejectModalVisible(false);
      setRejectReason('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to reject payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-base">Payment Proof Verification</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Facility {proof.facilityNumber} — Installment #{proof.installmentNumber}
                </div>
              </div>
            </div>
            <Tag color={proof.status === 'PENDING_VERIFICATION' ? 'purple' : proof.status === 'APPROVED' ? 'success' : 'error'}>
              {proof.status}
            </Tag>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={920}
        destroyOnClose
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
          {/* Left Column: Slip Document Preview */}
          <div className="lg:col-span-7 flex flex-col bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Submitted Slip Document
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={slipDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open Full
                </a>
                <a
                  href={slipDownloadUrl}
                  download={proof.slipFileName}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[340px] max-h-[460px] bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
              {isImage ? (
                <img
                  src={slipDownloadUrl}
                  alt="Payment Slip"
                  className="max-w-full max-h-[440px] object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                  onClick={() => window.open(slipDownloadUrl, '_blank')}
                />
              ) : isPdf ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-500/30">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{proof.slipFileName}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PDF Document Attached</p>
                  <Button
                    type="primary"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => window.open(slipDownloadUrl, '_blank')}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Open PDF Viewer
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 block">{proof.slipFileName}</span>
                  <a href={slipDownloadUrl} download className="text-xs text-blue-500 underline mt-2 inline-block">
                    Download File to View
                  </a>
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-right">
              {proof.slipFileName} • {proof.slipFileSize ? `${(proof.slipFileSize / 1024).toFixed(1)} KB` : ''}
            </div>
          </div>

          {/* Right Column: Claimed Details & Decision */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Borrower Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Borrower Profile
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    {proof.borrowerName?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{proof.borrowerName || 'Borrower'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{proof.borrowerEmail || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Claimed Transaction Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Claimed Payment Details
                </span>

                <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700/60 pb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Claimed Amount</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    LKR {Number(proof.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Txn / Slip Ref</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold block truncate">
                      {proof.referenceNumber || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Deposit Date</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium block">
                      {proof.paymentDate ? dayjs(proof.paymentDate).format('DD MMM YYYY') : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block">Payment Channel</span>
                  <Tag color="cyan" className="mt-0.5 font-medium">
                    {proof.paymentMethod || 'BANK_TRANSFER'}
                  </Tag>
                </div>

                {proof.borrowerRemarks && (
                  <div className="text-xs pt-1 border-t border-slate-200 dark:border-slate-700/40">
                    <span className="text-slate-500 dark:text-slate-400 block">Borrower Remarks:</span>
                    <span className="text-slate-700 dark:text-slate-300 italic">"{proof.borrowerRemarks}"</span>
                  </div>
                )}
              </div>

              {/* Status Notice if already reviewed */}
              {proof.status !== 'PENDING_VERIFICATION' && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Reviewed by {proof.reviewedByName || 'Officer'} on {proof.reviewedAt ? dayjs(proof.reviewedAt).format('DD MMM YYYY, HH:mm') : 'N/A'}
                  </div>
                  {proof.rejectionReason && (
                    <div className="mt-1 text-rose-600 dark:text-rose-400">
                      Reason: {proof.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decision Actions */}
            {proof.status === 'PENDING_VERIFICATION' ? (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Popconfirm
                  title="Approve and Record Payment?"
                  description={`This will confirm receipt of LKR ${Number(proof.amount || 0).toLocaleString()} and officially credit Installment #${proof.installmentNumber}.`}
                  onConfirm={handleApprove}
                  okText="Yes, Approve"
                  cancelText="Cancel"
                  okButtonProps={{ className: 'bg-emerald-600 hover:bg-emerald-500' }}
                >
                  <Button
                    type="primary"
                    icon={<FileCheck className="w-4 h-4" />}
                    loading={submitting}
                    block
                    className="bg-emerald-600 hover:bg-emerald-500 font-semibold border-none h-10 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    Approve & Settle Payment
                  </Button>
                </Popconfirm>

                <Button
                  danger
                  icon={<FileX className="w-4 h-4" />}
                  onClick={() => setRejectModalVisible(true)}
                  disabled={submitting}
                  block
                  className="h-9 flex items-center justify-center gap-1.5 font-medium"
                >
                  Reject Proof Slip
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <Button onClick={onClose} block>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Reject Reason Dialog */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <span>Reject Payment Proof</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRejectModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            loading={submitting}
            onClick={handleReject}
            className="font-semibold"
          >
            Confirm Rejection & Notify
          </Button>,
        ]}
        width={480}
        destroyOnClose
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
            Please specify why this payment proof cannot be accepted. The borrower will receive an in-app notification with this reason so they can correct and re-upload.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              'Slip image is blurred or illegible',
              'Transaction reference number not found in bank ledger',
              'Payment amount does not match slip deposit',
              'Deposit slip was credited to an incorrect account',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRejectReason(preset)}
                className="text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-left transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          <Input.TextArea
            rows={3}
            placeholder="Type specific rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </>
  );
};

export default PaymentProofReviewModal;
