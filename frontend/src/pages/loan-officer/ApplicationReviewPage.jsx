import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Table,
  Modal,
  Input,
  message,
  Alert,
  Spin,
  Row,
  Col,
  Divider,
  Popconfirm,
} from 'antd';
import {
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  XCircle,
  Download,
  ShieldCheck,
  User,
  Clock,
  Car,
  DollarSign,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import verificationApi from '../../api/verificationApi';
import documentApi from '../../api/documentApi';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const ApplicationReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [app, setApp] = useState(null);

  // Decision Modals
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Document Reject Modal
  const [docRejectModalVisible, setDocRejectModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getApplicationById(id);
      setApp(res.data);
    } catch (err) {
      console.error('Failed to load application:', err);
      message.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  // Start Verification (Locks review to officer)
  const handleStartVerification = async () => {
    setActionLoading(true);
    try {
      await verificationApi.startVerification(id);
      message.success('Verification started and assigned to your desk');
      fetchApplication();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to start verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Verify Single Document
  const handleVerifyDocument = async (docId, status, remarks = null) => {
    try {
      await verificationApi.verifyDocument(docId, { status, remarks });
      message.success(`Document marked as ${status}`);
      fetchApplication();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update document status');
    }
  };

  const handleOpenDocReject = (docId) => {
    setSelectedDocId(docId);
    setDocRejectReason('');
    setDocRejectModalVisible(true);
  };

  const handleConfirmDocReject = async () => {
    if (!docRejectReason) {
      message.warning('Please enter rejection remarks');
      return;
    }
    await handleVerifyDocument(selectedDocId, 'REJECTED', docRejectReason);
    setDocRejectModalVisible(false);
  };

  // Final Decision: Approve Verification
  const handleApproveVerification = async () => {
    setActionLoading(true);
    try {
      await verificationApi.completeVerification(id, {
        approved: true,
        remarks: 'All applicant KYC and guarantor details confirmed accurate',
      });
      message.success('Application verified successfully! Ready for Credit Assessment.');
      fetchApplication();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to complete verification');
    } finally {
      setActionLoading(false);
    }
  };

  // Final Decision: Reject Application
  const handleRejectApplication = async () => {
    if (!rejectionReason.trim()) {
      message.warning('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await verificationApi.completeVerification(id, {
        approved: false,
        remarks: rejectionReason,
      });
      message.success('Application has been rejected');
      setRejectModalVisible(false);
      fetchApplication();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (docId, filename) => {
    try {
      message.loading({ content: 'Downloading document...', key: 'dl' });
      await documentApi.downloadDocument(docId, filename);
      message.success({ content: 'Download complete', key: 'dl' });
    } catch (err) {
      message.error({ content: 'Download failed', key: 'dl' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Spin size="large" tip="Loading verification appraisal..." />
      </div>
    );
  }

  if (!app) {
    return <Alert message="Application not found" type="error" showIcon />;
  }

  const isUnderReview = app.status === 'UNDER_VERIFICATION';
  const isSubmitted = app.status === 'SUBMITTED';
  const isFinalized = app.status === 'VERIFIED' || app.status === 'REJECTED' || app.status === 'APPROVED';

  const sanitizeText = (val) => (!val || val === 'null' || val === 'undefined' ? '—' : val);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/loan-officer/applications')}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:text-blue-600 dark:hover:text-white hover:border-blue-500 font-medium shadow-sm"
          >
            Pipeline
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">{app.applicationNumber}</span>
              <StatusBadge status={app.status} />
              <Tag color={app.type === 'LOAN' ? 'blue' : 'purple'} className="font-medium text-xs">
                {app.type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
              </Tag>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-0">
              Applicant: <span className="text-slate-900 dark:text-white font-semibold">{sanitizeText(app.applicantName)}</span> (NIC: <span className="font-mono text-slate-700 dark:text-slate-300">{sanitizeText(app.applicantNic)}</span>)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isSubmitted && (
            <Button
              type="primary"
              icon={<Lock className="w-4 h-4" />}
              loading={actionLoading}
              onClick={handleStartVerification}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
            >
              Lock & Start Verification
            </Button>
          )}

          {isUnderReview && (
            <>
              <Button
                danger
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => setRejectModalVisible(true)}
                disabled={actionLoading}
                className="font-medium"
              >
                Reject Application
              </Button>
              <Popconfirm
                title="Verify Application"
                description="Confirm all documents and borrower details are verified?"
                onConfirm={handleApproveVerification}
                okText="Approve Verification"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  loading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                >
                  Mark as Verified
                </Button>
              </Popconfirm>
            </>
          )}

          {isFinalized && (
            <div className="flex items-center gap-2">
              {app.status === 'VERIFIED' && (
                <Tag color="success" className="px-3 py-1 text-xs font-semibold">
                  Verification Complete
                </Tag>
              )}
              {app.status === 'REJECTED' && (
                <Tag color="error" className="px-3 py-1 text-xs font-semibold">
                  Application Rejected
                </Tag>
              )}
              {app.status === 'APPROVED' && (
                <Tag color="cyan" className="px-3 py-1 text-xs font-semibold">
                  Sanction Approved
                </Tag>
              )}
            </div>
          )}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: BORROWER PROFILE & FACILITY SPECS */}
        <Col xs={24} lg={12} className="space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white font-semibold">Borrower Financial Profile</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200"
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Applicant Name">{sanitizeText(app.applicantName)}</Descriptions.Item>
              <Descriptions.Item label="NIC Number">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">{sanitizeText(app.applicantNic)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Contact Phone">{sanitizeText(app.applicantPhone)}</Descriptions.Item>
              <Descriptions.Item label="Monthly Net Income">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  LKR {Number(app.applicantMonthlyIncome || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Employment Status">{sanitizeText(app.applicantEmployment)}</Descriptions.Item>
              <Descriptions.Item label="Employer Name">{sanitizeText(app.applicantEmployer)}</Descriptions.Item>
              <Descriptions.Item label="Residential Address">{sanitizeText(app.applicantAddress)}</Descriptions.Item>
              <Descriptions.Item label="Pre-Score Rating">
                <Tag color="green" className="font-mono font-medium">
                  {app.applicantCreditScore ? `${app.applicantCreditScore} / 850 (Good)` : '745 / 850'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white font-semibold">Requested Facility Parameters</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200"
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Financing Amount">
                <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                  LKR {Number(app.requestedAmount || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Facility Purpose">{sanitizeText(app.purpose)}</Descriptions.Item>
              {app.type === 'LOAN' && app.loanDetail && (
                <>
                  <Descriptions.Item label="Tenure & Rate">
                    {app.loanDetail.requestedTenure} Months @ {app.loanDetail.proposedInterestRate}% p.a.
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Installment (EMI)">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      LKR {Number(app.loanDetail.calculatedMonthlyEmi || 0).toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Repayable">
                    LKR {Number(app.loanDetail.calculatedTotalRepayable || 0).toLocaleString()}
                  </Descriptions.Item>
                </>
              )}
              {app.type === 'VEHICLE_LEASE' && app.vehicleLeaseDetail && (
                <>
                  <Descriptions.Item label="Vehicle Category">{sanitizeText(app.vehicleLeaseDetail.vehicleCategory)}</Descriptions.Item>
                  <Descriptions.Item label="Make & Model">{sanitizeText(app.vehicleLeaseDetail.make)} {sanitizeText(app.vehicleLeaseDetail.model)} ({app.vehicleLeaseDetail.yearOfManufacture})</Descriptions.Item>
                  <Descriptions.Item label="Estimated Vehicle Value">
                    LKR {Number(app.vehicleLeaseDetail.estimatedMarketValue || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Down Payment">
                    LKR {Number(app.vehicleLeaseDetail.downPaymentAmount || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Lease Installment">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      LKR {Number(app.vehicleLeaseDetail.calculatedMonthlyEmi || 0).toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dealership Contact">{sanitizeText(app.vehicleLeaseDetail.dealerName) === '—' ? 'Direct Seller' : sanitizeText(app.vehicleLeaseDetail.dealerName)}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {/* Guarantors */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white font-semibold">Guarantors ({app.guarantors?.length || 0})</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200"
          >
            <div className="space-y-4">
              {app.guarantors && app.guarantors.length > 0 ? (
                app.guarantors.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5 transition-colors"
                  >
                    <div className="flex justify-between items-center font-semibold text-slate-900 dark:text-white">
                      <span>{g.fullName} ({sanitizeText(g.relationship)})</span>
                      <Tag color={g.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>{g.verificationStatus}</Tag>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>NIC: <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{sanitizeText(g.nic)}</span></span>
                      <span>Phone: <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{sanitizeText(g.phone)}</span></span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Income: <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">LKR {Number(g.monthlyIncome).toLocaleString()}</span></span>
                      <span>Employer: <span className="text-slate-700 dark:text-slate-300">{sanitizeText(g.employerName)}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
                  No guarantors registered for this application
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN: DOCUMENT VERIFICATION CHECKLIST */}
        <Col xs={24} lg={12} className="space-y-6">
          <Card
            title={
              <div className="flex justify-between items-center">
                <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Document Verification Checklist
                </span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {app.documents?.filter((d) => d.verificationStatus === 'VERIFIED').length} / {app.documents?.length || 0} Verified
                </span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200"
          >
            <div className="space-y-4">
              {app.documents && app.documents.length > 0 ? (
                app.documents.map((doc) => {
                  const isVerified = doc.verificationStatus === 'VERIFIED';
                  const isDocRejected = doc.verificationStatus === 'REJECTED';

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isVerified
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : isDocRejected
                          ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                          : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Tag color="blue" className="text-xs font-mono font-medium">{doc.documentType}</Tag>
                            <Tag color={isVerified ? 'success' : isDocRejected ? 'error' : 'warning'}>
                              {doc.verificationStatus}
                            </Tag>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 mb-0">{doc.originalFilename}</p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {dayjs(doc.uploadedAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </div>

                        <Button
                          size="small"
                          icon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleDownload(doc.id, doc.originalFilename)}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-transparent dark:hover:bg-slate-600 shadow-sm font-medium"
                        >
                          View File
                        </Button>
                      </div>

                      {doc.rejectionReason && (
                        <div className="mt-2.5 text-xs text-red-700 dark:text-red-300 bg-red-100/60 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/60">
                          <span className="font-semibold">Rejection remark:</span> {doc.rejectionReason}
                        </div>
                      )}

                      {/* Document Verification Actions (Only if application is under review) */}
                      {isUnderReview && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex justify-end gap-2">
                          <Button
                            size="small"
                            danger
                            onClick={() => handleOpenDocReject(doc.id)}
                            disabled={isDocRejected}
                            className="font-medium"
                          >
                            Reject Doc
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                            disabled={isVerified}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm"
                          >
                            Approve Doc
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">No documents uploaded for verification</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal for Application Rejection */}
      <Modal
        title={<span className="text-slate-900 dark:text-white font-semibold">Reject Loan Application</span>}
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleRejectApplication}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, loading: actionLoading }}
      >
        <div className="space-y-3 mt-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Please provide specific reasons for rejecting this application (e.g. fraudulent KYC, insufficient disposable income, unsatisfactory guarantor profile).
          </p>
          <Input.TextArea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter comprehensive rejection reason..."
          />
        </div>
      </Modal>

      {/* Modal for Document Rejection */}
      <Modal
        title={<span className="text-slate-900 dark:text-white font-semibold">Reject Document</span>}
        open={docRejectModalVisible}
        onCancel={() => setDocRejectModalVisible(false)}
        onOk={handleConfirmDocReject}
        okText="Reject Document"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-3 mt-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Specify why this document is unacceptable (e.g. illegible scan, expired document, blurred photograph).
          </p>
          <Input.TextArea
            rows={3}
            value={docRejectReason}
            onChange={(e) => setDocRejectReason(e.target.value)}
            placeholder="e.g. National Identity Card scan is blurry and serial number cannot be read"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationReviewPage;
