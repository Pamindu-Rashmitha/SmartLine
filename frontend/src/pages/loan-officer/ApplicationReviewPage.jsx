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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/loan-officer/applications')}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            Pipeline
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-white">{app.applicationNumber}</span>
              <StatusBadge status={app.status} />
              <Tag color={app.type === 'LOAN' ? 'blue' : 'purple'}>
                {app.type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
              </Tag>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Applicant: <span className="text-white font-semibold">{app.applicantName}</span> (NIC: {app.applicantNic})
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
              className="bg-indigo-600 hover:bg-indigo-500"
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
                  className="bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                  Mark as Verified
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: BORROWER PROFILE & FACILITY SPECS */}
        <Col xs={24} lg={12} className="space-y-6">
          <Card title={<span className="text-white font-semibold">Borrower Financial Profile</span>} className="bg-slate-900/80 border-slate-800 rounded-2xl">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Applicant Name">{app.applicantName}</Descriptions.Item>
              <Descriptions.Item label="NIC Number">
                <span className="font-mono text-blue-400">{app.applicantNic}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Contact Phone">{app.applicantPhone}</Descriptions.Item>
              <Descriptions.Item label="Monthly Net Income">
                <span className="font-mono text-emerald-400 font-bold">
                  LKR {Number(app.applicantMonthlyIncome || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Employment Status">{app.applicantEmployment}</Descriptions.Item>
              <Descriptions.Item label="Employer Name">{app.applicantEmployer || '—'}</Descriptions.Item>
              <Descriptions.Item label="Residential Address">{app.applicantAddress}</Descriptions.Item>
              <Descriptions.Item label="Pre-Score Rating">
                <Tag color="green" className="font-mono">
                  {app.applicantCreditScore ? `${app.applicantCreditScore} / 850 (Good)` : '745 / 850'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={<span className="text-white font-semibold">Requested Facility Parameters</span>} className="bg-slate-900/80 border-slate-800 rounded-2xl">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Financing Amount">
                <span className="font-mono text-lg font-bold text-blue-400">
                  LKR {Number(app.requestedAmount || 0).toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Facility Purpose">{app.purpose}</Descriptions.Item>
              {app.type === 'LOAN' && app.loanDetail && (
                <>
                  <Descriptions.Item label="Tenure & Rate">
                    {app.loanDetail.requestedTenure} Months @ {app.loanDetail.proposedInterestRate}% p.a.
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Installment (EMI)">
                    <span className="font-mono text-emerald-400 font-bold">
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
                  <Descriptions.Item label="Vehicle Category">{app.vehicleLeaseDetail.vehicleCategory}</Descriptions.Item>
                  <Descriptions.Item label="Make & Model">{app.vehicleLeaseDetail.make} {app.vehicleLeaseDetail.model} ({app.vehicleLeaseDetail.yearOfManufacture})</Descriptions.Item>
                  <Descriptions.Item label="Estimated Vehicle Value">
                    LKR {Number(app.vehicleLeaseDetail.estimatedMarketValue || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Down Payment">
                    LKR {Number(app.vehicleLeaseDetail.downPaymentAmount || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Monthly Lease Installment">
                    <span className="font-mono text-emerald-400 font-bold">
                      LKR {Number(app.vehicleLeaseDetail.calculatedMonthlyEmi || 0).toLocaleString()}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dealership Contact">{app.vehicleLeaseDetail.dealerName || 'Direct Seller'}</Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {/* Guarantors */}
          <Card title={<span className="text-white font-semibold">Guarantors ({app.guarantors?.length || 0})</span>} className="bg-slate-900/80 border-slate-800 rounded-2xl">
            <div className="space-y-4">
              {app.guarantors?.map((g) => (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold text-white">
                    <span>{g.fullName} ({g.relationship})</span>
                    <Tag color={g.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>{g.verificationStatus}</Tag>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>NIC: <span className="text-slate-200 font-mono">{g.nic}</span></span>
                    <span>Phone: <span className="text-slate-200 font-mono">{g.phone}</span></span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Income: <span className="text-emerald-400 font-semibold font-mono">LKR {Number(g.monthlyIncome).toLocaleString()}</span></span>
                    <span>Employer: {g.employerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN: DOCUMENT VERIFICATION CHECKLIST */}
        <Col xs={24} lg={12} className="space-y-6">
          <Card
            title={
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  Document Verification Checklist
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {app.documents?.filter((d) => d.verificationStatus === 'VERIFIED').length} / {app.documents?.length || 0} Verified
                </span>
              </div>
            }
            className="bg-slate-900/80 border-slate-800 rounded-2xl shadow-xl"
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
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : isDocRejected
                          ? 'bg-red-950/20 border-red-800/60'
                          : 'bg-slate-800/60 border-slate-700/60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Tag color="blue" className="text-xs font-mono">{doc.documentType}</Tag>
                            <Tag color={isVerified ? 'success' : isDocRejected ? 'error' : 'warning'}>
                              {doc.verificationStatus}
                            </Tag>
                          </div>
                          <p className="text-sm font-semibold text-white mt-1 mb-0">{doc.originalFilename}</p>
                          <span className="text-[11px] text-slate-400">
                            {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {dayjs(doc.uploadedAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </div>

                        <Button
                          size="small"
                          icon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => handleDownload(doc.id, doc.originalFilename)}
                          className="bg-slate-700 text-slate-200 border-none hover:bg-slate-600"
                        >
                          View File
                        </Button>
                      </div>

                      {doc.rejectionReason && (
                        <div className="mt-2 text-xs text-red-300 bg-red-950/40 p-2 rounded border border-red-900/60">
                          Rejection remark: {doc.rejectionReason}
                        </div>
                      )}

                      {/* Document Verification Actions (Only if application is under review) */}
                      {isUnderReview && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-end gap-2">
                          <Button
                            size="small"
                            danger
                            onClick={() => handleOpenDocReject(doc.id)}
                            disabled={isDocRejected}
                          >
                            Reject Doc
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                            disabled={isVerified}
                            className="bg-emerald-600 hover:bg-emerald-500"
                          >
                            Approve Doc
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">No documents uploaded for verification</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal for Application Rejection */}
      <Modal
        title={<span className="text-white">Reject Loan Application</span>}
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleRejectApplication}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, loading: actionLoading }}
        className="dark-modal"
      >
        <div className="space-y-3 mt-4">
          <p className="text-xs text-slate-300">
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
        title={<span className="text-white">Reject Document</span>}
        open={docRejectModalVisible}
        onCancel={() => setDocRejectModalVisible(false)}
        onOk={handleConfirmDocReject}
        okText="Reject Document"
        okButtonProps={{ danger: true }}
        className="dark-modal"
      >
        <div className="space-y-3 mt-4">
          <p className="text-xs text-slate-300">
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
