import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Tag,
  Button,
  Descriptions,
  Table,
  Timeline,
  Popconfirm,
  Spin,
  Alert,
  message,
  Row,
  Col,
  Steps,
  Divider,
} from 'antd';
import {
  ArrowLeft,
  FileText,
  User,
  ShieldAlert,
  Download,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  FileCheck,
  Building,
  Car,
  DollarSign,
  UserCheck,
  Calendar,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import documentApi from '../../api/documentApi';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const STATUS_STEPS = [
  { key: 'SUBMITTED', title: 'Submitted' },
  { key: 'UNDER_VERIFICATION', title: 'Verification' },
  { key: 'UNDER_CREDIT_ASSESSMENT', title: 'Credit Appraisal' },
  { key: 'APPROVED', title: 'Approved' },
  { key: 'DISBURSED', title: 'Disbursed' },
];

const getStepCurrent = (status) => {
  switch (status) {
    case 'DRAFT': return 0;
    case 'SUBMITTED': return 0;
    case 'UNDER_VERIFICATION': return 1;
    case 'VERIFIED':
    case 'UNDER_CREDIT_ASSESSMENT':
    case 'PENDING_FIELD_INSPECTION':
    case 'FIELD_INSPECTION_COMPLETED':
    case 'PENDING_SENIOR_APPROVAL': return 2;
    case 'APPROVED': return 3;
    case 'DISBURSED': return 4;
    case 'REJECTED': return 2;
    case 'CANCELLED': return 0;
    default: return 1;
  }
};

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [app, setApp] = useState(null);

  const fetchDetail = async () => {
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
    fetchDetail();
  }, [id]);

  const handleSubmitDraft = async () => {
    setActionLoading(true);
    try {
      await applicationApi.submitApplication(id);
      message.success('Application submitted for verification');
      fetchDetail();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelApplication = async () => {
    setActionLoading(true);
    try {
      await applicationApi.cancelApplication(id);
      message.success('Application cancelled');
      fetchDetail();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to cancel application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDoc = async (docId, originalFilename) => {
    try {
      message.loading({ content: 'Downloading document...', key: 'dl' });
      await documentApi.downloadDocument(docId, originalFilename);
      message.success({ content: 'Download complete', key: 'dl' });
    } catch (err) {
      message.error({ content: 'Failed to download document file', key: 'dl' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Spin size="large" tip="Loading application details..." />
      </div>
    );
  }

  if (!app) {
    return (
      <Alert
        message="Application Not Found"
        description="The requested loan application could not be found or access is unauthorized."
        type="error"
        showIcon
      />
    );
  }

  const currentStepIdx = getStepCurrent(app.status);
  const isRejected = app.status === 'REJECTED';
  const isCancelled = app.status === 'CANCELLED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
          className="border-slate-800 text-slate-300 hover:text-white"
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          {app.status === 'DRAFT' && (
            <Button
              type="primary"
              icon={<Send className="w-4 h-4" />}
              loading={actionLoading}
              onClick={handleSubmitDraft}
              className="bg-blue-600"
            >
              Submit for Verification
            </Button>
          )}

          {(app.status === 'DRAFT' || app.status === 'SUBMITTED') && (
            <Popconfirm
              title="Cancel Application"
              description="Are you sure you want to cancel this application?"
              onConfirm={handleCancelApplication}
              okText="Yes, Cancel"
              cancelText="No"
            >
              <Button danger icon={<XCircle className="w-4 h-4" />} loading={actionLoading}>
                Withdraw Application
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {/* Header Overview Card */}
      <Card className="bg-slate-900/90 border-slate-800 shadow-xl rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-white">{app.applicationNumber}</span>
              <StatusBadge status={app.status} />
              <Tag color={app.type === 'LOAN' ? 'blue' : 'purple'}>
                {app.type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
              </Tag>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Lodged by <span className="text-slate-200 font-semibold">{app.applicantName}</span> (NIC: {app.applicantNic}) on {dayjs(app.createdAt).format('YYYY-MM-DD HH:mm')}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400">Total Requested Financing</span>
            <p className="text-2xl font-mono font-black text-blue-400 m-0">
              LKR {Number(app.requestedAmount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Lifecycle Stepper */}
        {!isCancelled && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <Steps
              current={currentStepIdx}
              status={isRejected ? 'error' : 'process'}
              items={STATUS_STEPS.map((s, idx) => ({
                title: s.title,
                status: isRejected && idx === currentStepIdx ? 'error' : undefined,
              }))}
            />
          </div>
        )}

        {app.rejectionReason && (
          <Alert
            message="Rejection Reason"
            description={app.rejectionReason}
            type="error"
            showIcon
            className="mt-6 bg-red-950/40 border-red-800/80 text-red-200"
          />
        )}
      </Card>

      {/* Tabs of detailed sections */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl rounded-2xl">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Facility Details
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  <Descriptions title={<span className="text-slate-200 text-sm font-semibold">Borrower Profile</span>} bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Full Name">{app.applicantName}</Descriptions.Item>
                    <Descriptions.Item label="NIC Number">{app.applicantNic}</Descriptions.Item>
                    <Descriptions.Item label="Contact Phone">{app.applicantPhone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{app.applicantEmail}</Descriptions.Item>
                    <Descriptions.Item label="Employment Status">{app.applicantEmployment}</Descriptions.Item>
                    <Descriptions.Item label="Monthly Net Income">
                      <span className="font-mono text-emerald-400 font-semibold">
                        LKR {Number(app.applicantMonthlyIncome || 0).toLocaleString()}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Employer / Company">{app.applicantEmployer || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Residential Address" span={2}>{app.applicantAddress}</Descriptions.Item>
                  </Descriptions>

                  <Divider className="border-slate-800" />

                  {app.type === 'LOAN' && app.loanDetail && (
                    <Descriptions title={<span className="text-slate-200 text-sm font-semibold">Money Loan Terms</span>} bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
                      <Descriptions.Item label="Loan Purpose">{app.loanDetail.loanPurpose}</Descriptions.Item>
                      <Descriptions.Item label="Requested Tenure">{app.loanDetail.requestedTenure} Months</Descriptions.Item>
                      <Descriptions.Item label="Interest Rate">{app.loanDetail.proposedInterestRate}% p.a.</Descriptions.Item>
                      <Descriptions.Item label="Monthly EMI">
                        <span className="font-mono text-blue-400 font-bold">
                          LKR {Number(app.loanDetail.calculatedMonthlyEmi || 0).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Repayable">
                        <span className="font-mono text-slate-200 font-medium">
                          LKR {Number(app.loanDetail.calculatedTotalRepayable || 0).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Existing Debt">
                        LKR {Number(app.loanDetail.totalExistingDebt || 0).toLocaleString()}
                      </Descriptions.Item>
                    </Descriptions>
                  )}

                  {app.type === 'VEHICLE_LEASE' && app.vehicleLeaseDetail && (
                    <Descriptions title={<span className="text-slate-200 text-sm font-semibold">Vehicle Lease Terms & Asset Specification</span>} bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
                      <Descriptions.Item label="Category">{app.vehicleLeaseDetail.vehicleCategory}</Descriptions.Item>
                      <Descriptions.Item label="Make & Model">{app.vehicleLeaseDetail.make} {app.vehicleLeaseDetail.model}</Descriptions.Item>
                      <Descriptions.Item label="Year of Manufacture">{app.vehicleLeaseDetail.yearOfManufacture}</Descriptions.Item>
                      <Descriptions.Item label="Estimated Vehicle Value">
                        LKR {Number(app.vehicleLeaseDetail.estimatedMarketValue || 0).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Down Payment Amount">
                        LKR {Number(app.vehicleLeaseDetail.downPaymentAmount || 0).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Financed Amount (Lease)">
                        <span className="font-mono text-blue-400 font-bold">
                          LKR {Number(app.requestedAmount || 0).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Monthly Lease Installment">
                        <span className="font-mono text-emerald-400 font-bold">
                          LKR {Number(app.vehicleLeaseDetail.calculatedMonthlyEmi || 0).toLocaleString()}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tenure & Rate">{app.vehicleLeaseDetail.requestedTenure} Mo @ {app.vehicleLeaseDetail.proposedInterestRate}%</Descriptions.Item>
                      <Descriptions.Item label="Condition / Reg #">{app.vehicleLeaseDetail.vehicleCondition} ({app.vehicleLeaseDetail.registrationNumber || 'Unregistered'})</Descriptions.Item>
                      <Descriptions.Item label="Dealership">{app.vehicleLeaseDetail.dealerName || 'Direct'}</Descriptions.Item>
                    </Descriptions>
                  )}
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Guarantors ({app.guarantors?.length || 0})
                </span>
              ),
              children: (
                <Row gutter={[16, 16]} className="pt-2">
                  {app.guarantors && app.guarantors.length > 0 ? (
                    app.guarantors.map((g) => (
                      <Col xs={24} md={12} key={g.id}>
                        <Card className="bg-slate-800/60 border-slate-700/80 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-white font-semibold text-sm m-0">{g.fullName}</h4>
                              <span className="text-xs text-slate-400">{g.relationship}</span>
                            </div>
                            <Tag color={g.verificationStatus === 'VERIFIED' ? 'success' : g.verificationStatus === 'REJECTED' ? 'error' : 'warning'}>
                              {g.verificationStatus}
                            </Tag>
                          </div>
                          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                            <div className="flex justify-between">
                              <span className="text-slate-400">NIC:</span>
                              <span className="font-mono">{g.nic}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phone:</span>
                              <span className="font-mono">{g.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Employer:</span>
                              <span>{g.employerName} ({g.occupation})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Monthly Net Income:</span>
                              <span className="font-mono text-emerald-400 font-semibold">
                                LKR {Number(g.monthlyIncome || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}>
                      <div className="text-center py-8 text-slate-400">No guarantors attached</div>
                    </Col>
                  )}
                </Row>
              ),
            },
            {
              key: '3',
              label: (
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> Document Vault ({app.documents?.length || 0})
                </span>
              ),
              children: (
                <Row gutter={[16, 16]} className="pt-2">
                  {app.documents && app.documents.length > 0 ? (
                    app.documents.map((doc) => (
                      <Col xs={24} md={12} key={doc.id}>
                        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                          <div className="truncate max-w-[280px]">
                            <div className="flex items-center gap-2">
                              <Tag color="blue" className="text-[11px] font-mono">{doc.documentType}</Tag>
                              <Tag color={doc.verificationStatus === 'VERIFIED' ? 'success' : doc.verificationStatus === 'REJECTED' ? 'error' : 'warning'} className="text-[10px]">
                                {doc.verificationStatus}
                              </Tag>
                            </div>
                            <p className="text-xs font-semibold text-white truncate mt-1 mb-0">{doc.originalFilename}</p>
                            <span className="text-[10px] text-slate-400">
                              {(doc.fileSize / 1024).toFixed(1)} KB • {dayjs(doc.uploadedAt).format('YYYY-MM-DD HH:mm')}
                            </span>
                          </div>

                          <Button
                            type="primary"
                            size="small"
                            icon={<Download className="w-3.5 h-3.5" />}
                            onClick={() => handleDownloadDoc(doc.id, doc.originalFilename)}
                            className="bg-blue-600 hover:bg-blue-500"
                          >
                            Download
                          </Button>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <Col span={24}>
                      <div className="text-center py-8 text-slate-400">No documents uploaded yet</div>
                    </Col>
                  )}
                </Row>
              ),
            },
            {
              key: '4',
              label: (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Credit Appraisal
                </span>
              ),
              children: (
                <div className="pt-2">
                  {app.creditAssessment ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3 items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Risk Assessment:</span>
                          <Tag
                            color={
                              app.creditAssessment.overallRiskLevel === 'LOW'
                                ? 'success'
                                : app.creditAssessment.overallRiskLevel === 'MEDIUM'
                                ? 'warning'
                                : 'error'
                            }
                            className="font-bold uppercase"
                          >
                            {app.creditAssessment.overallRiskLevel} RISK
                          </Tag>
                        </div>
                        {app.creditAssessment.recommendation && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Recommendation:</span>
                            <Tag color="purple">{app.creditAssessment.recommendation}</Tag>
                          </div>
                        )}
                        {app.creditAssessment.decision && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Decision:</span>
                            <Tag color={app.creditAssessment.decision === 'APPROVED' ? 'success' : 'error'}>
                              {app.creditAssessment.decision}
                            </Tag>
                          </div>
                        )}
                        {app.creditAssessment.assessedByName && (
                          <span className="text-xs text-slate-400 ml-auto">
                            Assessed by: <span className="text-slate-200">{app.creditAssessment.assessedByName}</span>
                          </span>
                        )}
                      </div>

                      <Descriptions
                        title={<span className="text-slate-200 text-sm font-semibold">Underwriting Evaluation</span>}
                        bordered
                        column={{ xs: 1, sm: 2 }}
                        size="small"
                      >
                        <Descriptions.Item label="Income Verification">
                          <div className="flex items-center gap-2">
                            <Tag color={app.creditAssessment.incomeVerified ? 'success' : 'error'}>
                              {app.creditAssessment.incomeVerified ? 'Verified' : 'Not Verified'}
                            </Tag>
                            <span className="text-xs text-slate-300">{app.creditAssessment.incomeRemarks || '—'}</span>
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Employment Check">
                          <div className="flex items-center gap-2">
                            <Tag color={app.creditAssessment.employmentVerified ? 'success' : 'error'}>
                              {app.creditAssessment.employmentVerified ? 'Confirmed' : 'Unconfirmed'}
                            </Tag>
                            <span className="text-xs text-slate-300">{app.creditAssessment.employmentRemarks || '—'}</span>
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Debt-to-Income (DTI) Assessment" span={2}>
                          {app.creditAssessment.debtToIncomeNotes || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="CRIB / Credit History Notes" span={2}>
                          {app.creditAssessment.creditHistoryNotes || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Collateral & Valuation Notes" span={2}>
                          {app.creditAssessment.collateralNotes || '—'}
                        </Descriptions.Item>
                        {app.creditAssessment.decisionReason && (
                          <Descriptions.Item label="Decision Remarks" span={2}>
                            <span className="text-amber-400">{app.creditAssessment.decisionReason}</span>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      Credit appraisal has not yet been conducted for this application.
                    </div>
                  )}
                </div>
              ),
            },
            ...(app.type === 'VEHICLE_LEASE' || app.vehicleInspection
              ? [
                  {
                    key: '5',
                    label: (
                      <span className="flex items-center gap-2">
                        <Car className="w-4 h-4" /> Vehicle Inspection
                      </span>
                    ),
                    children: (
                      <div className="pt-2">
                        {app.vehicleInspection ? (
                          <div className="space-y-6">
                            <div className="flex flex-wrap gap-3 items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Rating:</span>
                                <Tag
                                  color={
                                    app.vehicleInspection.overallRating === 'EXCELLENT' ||
                                    app.vehicleInspection.overallRating === 'GOOD'
                                      ? 'success'
                                      : 'warning'
                                  }
                                  className="font-bold"
                                >
                                  {app.vehicleInspection.overallRating}
                                </Tag>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Inspection Date:</span>
                                <span className="text-xs font-mono text-slate-200">
                                  {app.vehicleInspection.inspectionDate}
                                </span>
                              </div>
                              {app.vehicleInspection.inspectedByName && (
                                <span className="text-xs text-slate-400 ml-auto">
                                  Inspector:{' '}
                                  <span className="text-slate-200">{app.vehicleInspection.inspectedByName}</span>
                                </span>
                              )}
                            </div>

                            <Descriptions
                              title={<span className="text-slate-200 text-sm font-semibold">Technical Valuation Report</span>}
                              bordered
                              column={{ xs: 1, sm: 2, md: 3 }}
                              size="small"
                            >
                              <Descriptions.Item label="Market Valuation">
                                <span className="font-mono text-emerald-400 font-bold">
                                  LKR {Number(app.vehicleInspection.estimatedMarketValue || 0).toLocaleString()}
                                </span>
                              </Descriptions.Item>
                              <Descriptions.Item label="Forced Sale Value">
                                <span className="font-mono text-amber-400 font-bold">
                                  LKR {Number(app.vehicleInspection.forcedSaleValue || 0).toLocaleString()}
                                </span>
                              </Descriptions.Item>
                              <Descriptions.Item label="Recommended Max Financing">
                                <span className="font-mono text-blue-400 font-bold">
                                  LKR {Number(app.vehicleInspection.recommendedValue || 0).toLocaleString()}
                                </span>
                              </Descriptions.Item>
                              <Descriptions.Item label="Physical Condition" span={2}>
                                {app.vehicleInspection.physicalCondition || '—'}
                              </Descriptions.Item>
                              <Descriptions.Item label="Mechanical Condition">
                                {app.vehicleInspection.mechanicalCondition || '—'}
                              </Descriptions.Item>
                              <Descriptions.Item label="Inspector Remarks" span={3}>
                                {app.vehicleInspection.remarks || '—'}
                              </Descriptions.Item>
                            </Descriptions>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            Vehicle inspection has been scheduled and is pending field officer review.
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
            {
              key: '6',
              label: (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Audit & Status History
                </span>
              ),
              children: (
                <div className="pt-4 px-2">
                  <Timeline
                    items={app.statusHistory?.map((h) => ({
                      color:
                        h.toStatus === 'VERIFIED' || h.toStatus === 'APPROVED'
                          ? 'green'
                          : h.toStatus === 'REJECTED'
                          ? 'red'
                          : 'blue',
                      children: (
                        <div>
                          <div className="flex items-center gap-2">
                            <Tag color="blue">{h.toStatus}</Tag>
                            <span className="text-xs text-slate-400 font-mono">
                              {dayjs(h.changedAt).format('YYYY-MM-DD HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1 mb-0 font-medium">
                            {h.remarks || 'Status transition'}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Action performed by: {h.changedByName} ({h.changedByRole})
                          </span>
                        </div>
                      ),
                    }))}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ApplicationDetailPage;
