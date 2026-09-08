import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Tag,
  Input,
  Modal,
  Row,
  Col,
  Alert,
  Divider,
  message,
} from 'antd';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  User,
  Users,
  Car,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import authorizationApi from '../../api/authorizationApi';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AuthorizationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);

  // Decision modal
  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [remarks, setRemarks] = useState('');

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getApplicationDetail(id);
      if (res.data) {
        setApplication(res.data);
      }
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

  const handleOpenDecisionModal = (approved) => {
    setIsApproved(approved);
    setRemarks('');
    setDecisionModalVisible(true);
  };

  const handleConfirmDecision = async () => {
    if (!isApproved && !remarks.trim()) {
      message.error('Please specify a reason for declining the sanction');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authorizationApi.recordDecision(id, {
        approved: isApproved,
        remarks,
      });
      message.success(isApproved ? 'Executive sanction granted!' : 'Application declined');
      setDecisionModalVisible(false);
      setApplication(res.data);
      navigate('/approvals');
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to record authorization decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading executive sanction dossier...</p>
      </div>
    );
  }

  const requestedAmount = Number(application.requestedAmount || 0);
  const isVehicleLease = application.type === 'VEHICLE_LEASE';
  const ca = application.creditAssessment;
  const vi = application.vehicleInspection;
  const monthlyEmi = application.loanDetail?.calculatedMonthlyEmi || application.vehicleLeaseDetail?.calculatedMonthlyEmi || 0;
  const monthlyIncome = Number(application.applicantMonthlyIncome || 1);
  const existingDebt = Number(application.loanDetail?.totalExistingDebt || 0);
  const calculatedDti = (((existingDebt + Number(monthlyEmi)) / monthlyIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/approvals')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 flex items-center justify-center h-10 w-10 p-0 rounded-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0 font-mono">
                {application.applicationNumber}
              </h1>
              <Tag color={application.type === 'LOAN' ? 'blue' : 'purple'} className="font-semibold text-xs">
                {application.type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
              </Tag>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Borrower: <span className="text-slate-200 font-semibold">{application.applicantName}</span> | NIC: {application.applicantNic}
            </p>
          </div>
        </div>

        {/* Action Decision Buttons if in PENDING_SENIOR_APPROVAL */}
        {application.status === 'PENDING_SENIOR_APPROVAL' && (
          <div className="flex items-center gap-2.5">
            <Button
              danger
              onClick={() => handleOpenDecisionModal(false)}
              className="font-semibold text-xs h-10 px-4 flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Decline Sanction
            </Button>
            <Button
              type="primary"
              onClick={() => handleOpenDecisionModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-10 px-5 border-0 flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" /> Authorize & Sanction Facility
            </Button>
          </div>
        )}
      </div>

      {/* High-Value Exposure Alert */}
      {application.status === 'PENDING_SENIOR_APPROVAL' && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          message={
            <span className="font-bold text-amber-300 text-sm">
              Higher-Level Executive Sanction Required (US10)
            </span>
          }
          description={
            <span className="text-xs text-slate-300 leading-relaxed block mt-1">
              Facility request of <strong className="text-white">LKR {requestedAmount.toLocaleString()}</strong> requires executive committee approval under Credit Policy (exceeds delegated LKR 500,000 threshold or referred by Credit Management).
            </span>
          }
          className="bg-amber-950/30 border-amber-800/80 rounded-2xl p-4 shadow-lg"
        />
      )}

      {/* 4-Quadrant Executive Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quadrant 1: Facility & Pricing Structure */}
        <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            1. Facility & Pricing Terms
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Sanction Amount:</span>
              <span className="text-base font-bold text-white">
                LKR {requestedAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Tenure:</span>
              <span className="text-slate-200 font-semibold">
                {application.loanDetail?.requestedTenure || application.vehicleLeaseDetail?.requestedTenure || '-'} Months
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Monthly Installment (EMI):</span>
              <span className="text-purple-400 font-bold">
                LKR {Number(monthlyEmi).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Interest Rate:</span>
              <span className="text-slate-200">
                {application.loanDetail?.proposedInterestRate || application.vehicleLeaseDetail?.proposedInterestRate || '14.00'}% p.a.
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Facility Purpose:</span>
              <span className="text-slate-200 max-w-[250px] text-right font-medium">
                {application.purpose || application.loanDetail?.loanPurpose || '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* Quadrant 2: Borrower Capacity & Repayment Ratios */}
        <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            2. Borrower Capacity & Ratios
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Declared Monthly Income:</span>
              <span className="text-emerald-400 font-bold">
                LKR {monthlyIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Employer / Business:</span>
              <span className="text-slate-200 font-semibold">{application.applicantEmployer || 'Permanent'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Existing Monthly Debt:</span>
              <span className="text-slate-300">LKR {existingDebt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Debt-to-Income (DTI):</span>
              <span
                className={`font-bold ${
                  Number(calculatedDti) <= 40 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {calculatedDti}% ({Number(calculatedDti) <= 45 ? 'Adequate Coverage' : 'Elevated DTI'})
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">CRIB Score Rating:</span>
              <span className="text-blue-400 font-bold">
                {application.applicantCreditScore || 740} / 850 (Grade A)
              </span>
            </div>
          </div>
        </Card>

        {/* Quadrant 3: Credit Manager Appraisal & Recommendation */}
        <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white m-0 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              3. Credit Appraisal (Credit Manager)
            </h3>
            {ca?.overallRiskLevel && (
              <Tag
                color={
                  ca.overallRiskLevel === 'LOW'
                    ? 'emerald'
                    : ca.overallRiskLevel === 'MEDIUM'
                    ? 'amber'
                    : 'rose'
                }
                className="font-bold text-[11px]"
              >
                {ca.overallRiskLevel} RISK
              </Tag>
            )}
          </div>

          {ca ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Appraised By:</span>
                <span className="text-slate-200 font-semibold">{ca.assessedByName || 'Credit Manager'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Income Verification:</span>
                <span className={ca.incomeVerified ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {ca.incomeVerified ? 'Verified via Payslip & Statements' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Employment Verification:</span>
                <span className={ca.employmentVerified ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {ca.employmentVerified ? 'Confirmed with Employer' : 'Pending'}
                </span>
              </div>
              {ca.debtToIncomeNotes && (
                <div className="py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 block mb-0.5">DTI Analysis:</span>
                  <span className="text-slate-300 text-[11px]">{ca.debtToIncomeNotes}</span>
                </div>
              )}
              {ca.creditHistoryNotes && (
                <div className="py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 block mb-0.5">CRIB Evaluation:</span>
                  <span className="text-slate-300 text-[11px]">{ca.creditHistoryNotes}</span>
                </div>
              )}
              {ca.collateralNotes && (
                <div className="py-1">
                  <span className="text-slate-400 block mb-0.5">Security Evaluation:</span>
                  <span className="text-slate-300 text-[11px]">{ca.collateralNotes}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No formal credit assessment recorded yet.</p>
          )}
        </Card>

        {/* Quadrant 4: Security (Guarantors & Inspection) */}
        <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            4. Security & Collateral Coverage
          </h3>

          <div className="space-y-3 text-xs">
            {/* Guarantors */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">Attached Guarantors:</span>
              <div className="space-y-1.5">
                {application.guarantors?.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <span className="text-slate-200 font-bold block">{g.fullName} ({g.relationship})</span>
                      <span className="text-[10px] text-slate-400">Income: LKR {Number(g.monthlyIncome || 0).toLocaleString()} | {g.employerName}</span>
                    </div>
                    <StatusBadge status={g.verificationStatus} />
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Inspection if present */}
            {isVehicleLease && vi && (
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 font-semibold">Vehicle Valuation (Field Report):</span>
                  <Tag color="emerald" className="text-[10px] font-bold">{vi.overallRating}</Tag>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="text-white font-semibold">{application.vehicleLeaseDetail?.make} {application.vehicleLeaseDetail?.model} ({application.vehicleLeaseDetail?.registrationNumber || 'NEW'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Value:</span>
                    <span className="text-emerald-400 font-bold">LKR {Number(vi.estimatedMarketValue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Loan Ceiling:</span>
                    <span className="text-white font-bold">LKR {Number(vi.recommendedValue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Status History */}
      <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Underwriting Decision & Audit Trail
        </h3>
        <StatusTimeline history={application.statusHistory} />
      </Card>

      {/* Decision Confirmation Modal */}
      <Modal
        title={
          <span className="text-base font-bold text-white flex items-center gap-2">
            {isApproved ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Executive Sanction Authorization
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400" /> Decline / Reject Sanction
              </>
            )}
          </span>
        }
        open={decisionModalVisible}
        onCancel={() => setDecisionModalVisible(false)}
        onOk={handleConfirmDecision}
        confirmLoading={submitting}
        okText={isApproved ? 'Authorize Facility' : 'Decline Application'}
        okButtonProps={{
          danger: !isApproved,
          className: isApproved ? 'bg-emerald-600 hover:bg-emerald-500 font-bold' : '',
        }}
        cancelButtonProps={{ className: 'bg-slate-800 border-slate-700 text-slate-300' }}
        className="dark-modal"
      >
        <div className="space-y-4 py-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {isApproved
              ? `You are about to authorize executive approval for ${application.applicantName} for LKR ${requestedAmount.toLocaleString()}. This transitions the facility to APPROVED stage for agreement drafting.`
              : `You are declining executive sanction for ${application.applicantName}. Please provide formal grounds for rejection.`}
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isApproved ? 'Executive Notes & Sanction Covenants' : 'Grounds for Rejection *'}
            </label>
            <TextArea
              rows={4}
              placeholder={
                isApproved
                  ? 'Enter any special executive terms, rate conditions, or authorization notes...'
                  : 'Enter mandatory rejection justification...'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-200 text-xs rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuthorizationDetailPage;
