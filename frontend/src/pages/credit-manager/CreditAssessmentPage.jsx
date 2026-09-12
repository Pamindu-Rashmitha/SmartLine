import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Button,
  Tag,
  Input,
  Checkbox,
  Radio,
  Select,
  Modal,
  Space,
  Row,
  Col,
  Alert,
  message,
  Divider,
} from 'antd';
import {
  ShieldCheck,
  ArrowLeft,
  FileText,
  User,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  Save,
  Send,
  Download,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import creditApi from '../../api/creditApi';
import guarantorApi from '../../api/guarantorApi';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const CreditAssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('assessment');

  // Credit Assessment Form State
  const [incomeVerified, setIncomeVerified] = useState(false);
  const [incomeRemarks, setIncomeRemarks] = useState('');
  const [employmentVerified, setEmploymentVerified] = useState(false);
  const [employmentRemarks, setEmploymentRemarks] = useState('');
  const [dtiNotes, setDtiNotes] = useState('');
  const [cribNotes, setCribNotes] = useState('');
  const [collateralNotes, setCollateralNotes] = useState('');
  const [riskLevel, setRiskLevel] = useState('MEDIUM');
  const [recommendation, setRecommendation] = useState('APPROVE');

  // Modals
  const [decisionModalVisible, setDecisionModalVisible] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVE'); // APPROVE, REFER, REJECT
  const [decisionRemarks, setDecisionRemarks] = useState('');

  const [inspectionModalVisible, setInspectionModalVisible] = useState(false);
  const [inspectionRemarks, setInspectionRemarks] = useState('');

  const [guarantorModalVisible, setGuarantorModalVisible] = useState(false);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [guarantorStatus, setGuarantorStatus] = useState('VERIFIED');
  const [guarantorRemarks, setGuarantorRemarks] = useState('');

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getApplicationDetail(id);
      if (res.data) {
        setApplication(res.data);
        if (res.data.creditAssessment) {
          const ca = res.data.creditAssessment;
          setIncomeVerified(Boolean(ca.incomeVerified));
          setIncomeRemarks(ca.incomeRemarks || '');
          setEmploymentVerified(Boolean(ca.employmentVerified));
          setEmploymentRemarks(ca.employmentRemarks || '');
          setDtiNotes(ca.debtToIncomeNotes || '');
          setCribNotes(ca.creditHistoryNotes || '');
          setCollateralNotes(ca.collateralNotes || '');
          setRiskLevel(ca.overallRiskLevel || 'MEDIUM');
          setRecommendation(ca.recommendation || 'APPROVE');
        }
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

  const handleStartAssessment = async () => {
    try {
      const res = await creditApi.startAssessment(id);
      message.success('Assessment initiated successfully');
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to start assessment');
    }
  };

  const handleSaveAssessment = async () => {
    setSubmitting(true);
    try {
      await creditApi.saveAssessment(id, {
        incomeVerified,
        incomeRemarks,
        employmentVerified,
        employmentRemarks,
        debtToIncomeNotes: dtiNotes,
        creditHistoryNotes: cribNotes,
        collateralNotes,
        overallRiskLevel: riskLevel,
        recommendation,
      });
      message.success('Credit assessment saved successfully');
      fetchApplication();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to save credit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDecisionModal = (type) => {
    setDecisionType(type);
    setDecisionRemarks('');
    setDecisionModalVisible(true);
  };

  const handleConfirmDecision = async () => {
    if (decisionType === 'REJECT' && !decisionRemarks.trim()) {
      message.error('Please specify a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      // First save current assessment fields
      await creditApi.saveAssessment(id, {
        incomeVerified,
        incomeRemarks,
        employmentVerified,
        employmentRemarks,
        debtToIncomeNotes: dtiNotes,
        creditHistoryNotes: cribNotes,
        collateralNotes,
        overallRiskLevel: riskLevel,
        recommendation: decisionType === 'REFER' ? 'REFER_TO_SENIOR' : decisionType === 'REJECT' ? 'REJECT' : 'APPROVE',
      });

      const decisionPayload = {
        approved: decisionType !== 'REJECT',
        referToSenior: decisionType === 'REFER',
        remarks: decisionRemarks,
      };

      const res = await creditApi.recordCreditDecision(id, decisionPayload);
      message.success('Credit decision recorded successfully');
      setDecisionModalVisible(false);
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInspection = async () => {
    setSubmitting(true);
    try {
      const res = await creditApi.requestFieldInspection(id, inspectionRemarks);
      message.success('Field inspection requested successfully');
      setInspectionModalVisible(false);
      setApplication(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to request inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenGuarantorModal = (guarantor) => {
    setSelectedGuarantor(guarantor);
    setGuarantorStatus(guarantor.verificationStatus === 'REJECTED' ? 'REJECTED' : 'VERIFIED');
    setGuarantorRemarks(guarantor.verificationRemarks || '');
    setGuarantorModalVisible(true);
  };

  const handleConfirmGuarantorVerify = async () => {
    if (!selectedGuarantor) return;
    setSubmitting(true);
    try {
      await guarantorApi.verifyGuarantor(selectedGuarantor.id, {
        status: guarantorStatus,
        remarks: guarantorRemarks,
      });
      message.success(`Guarantor marked as ${guarantorStatus}`);
      setGuarantorModalVisible(false);
      fetchApplication();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to update guarantor verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading application underwriting desk...</p>
      </div>
    );
  }

  const requestedAmount = Number(application.requestedAmount || 0);
  const isHighValue = requestedAmount > 500000;
  const isVehicleLease = application.type === 'VEHICLE_LEASE';
  const monthlyIncome = Number(application.applicantMonthlyIncome || 1);
  const monthlyEmi = application.loanDetail?.calculatedMonthlyEmi || application.vehicleLeaseDetail?.calculatedMonthlyEmi || 0;
  const existingDebt = Number(application.loanDetail?.totalExistingDebt || 0);
  const calculatedDti = (((existingDebt + Number(monthlyEmi)) / monthlyIncome) * 100).toFixed(1);

  const sanitizeText = (val) => (!val || val === 'null' || val === 'undefined' ? '—' : val);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/underwriting')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 flex items-center justify-center h-10 w-10 p-0 rounded-xl shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0 font-mono">
                {application.applicationNumber}
              </h1>
              <Tag color={application.type === 'LOAN' ? 'blue' : 'purple'} className="font-semibold text-xs">
                {application.type === 'LOAN' ? 'Money Loan' : 'Vehicle Lease'}
              </Tag>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
              Borrower: <span className="text-slate-900 dark:text-slate-200 font-semibold">{sanitizeText(application.applicantName)}</span> (NIC: <span className="font-mono text-slate-700 dark:text-slate-300">{sanitizeText(application.applicantNic)}</span>)
            </p>
          </div>
        </div>

        {/* Action button if status is VERIFIED */}
        <div className="flex items-center gap-2">
          {application.status === 'VERIFIED' && (
            <Button
              type="primary"
              onClick={handleStartAssessment}
              className="bg-purple-600 hover:bg-purple-500 font-semibold text-xs h-10 shadow-sm"
            >
              Start Credit Assessment
            </Button>
          )}

          {isVehicleLease && application.status !== 'FIELD_INSPECTION_COMPLETED' && (
            <Button
              onClick={() => setInspectionModalVisible(true)}
              icon={<Car className="w-4 h-4" />}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-semibold text-xs h-10 flex items-center gap-1.5 shadow-sm"
            >
              Request Field Inspection
            </Button>
          )}
        </div>
      </div>

      {/* Financial Ratios & Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Requested Facility</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block mt-0.5">
            LKR {requestedAmount.toLocaleString()}
          </span>
          {isHighValue && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> &gt; 500k Sanction
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Monthly Installment (EMI)</span>
          <span className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400 block mt-0.5">
            LKR {Number(monthlyEmi).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {application.loanDetail?.requestedTenure || application.vehicleLeaseDetail?.requestedTenure || 0} Months Tenor
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Borrower Income</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
            LKR {monthlyIncome.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
            {sanitizeText(application.applicantEmployer) === '—' ? 'Permanent' : sanitizeText(application.applicantEmployer)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Debt-to-Income (DTI)</span>
          <span
            className={`text-sm sm:text-base font-bold block mt-0.5 ${
              Number(calculatedDti) <= 40
                ? 'text-emerald-600 dark:text-emerald-400'
                : Number(calculatedDti) <= 50
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {calculatedDti}%
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {Number(calculatedDti) <= 45 ? 'Within Policy Limit' : 'Requires Justification'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">CRIB Credit Rating</span>
          <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
            {application.applicantCreditScore || 720} / 850
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Optimal Credit History
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm dark:shadow">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Guarantor Coverage</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block mt-0.5">
            {application.guarantors?.length || 0} Attached
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {application.guarantors?.filter((g) => g.verificationStatus === 'VERIFIED').length} of {application.guarantors?.length || 0} Verified
          </span>
        </div>
      </div>

      {/* Main Tabbed Desk */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: 'assessment',
            label: (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Credit Evaluation & Decision
              </span>
            ),
            children: (
              <div className="space-y-6 mt-4">
                {/* Underwriting Form Grid */}
                <Row gutter={[20, 20]}>
                  {/* Left Column: Verification & Notes */}
                  <Col xs={24} lg={16}>
                    <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Income, Employment & CRIB Appraisal
                      </h3>

                      <div className="space-y-5">
                        {/* Income verification */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <Checkbox
                              checked={incomeVerified}
                              onChange={(e) => setIncomeVerified(e.target.checked)}
                              className="text-slate-800 dark:text-slate-200 font-semibold text-xs"
                            >
                              Income Verified via Bank Statements & Payslips
                            </Checkbox>
                            <Tag color={incomeVerified ? 'emerald' : 'default'} className="text-[11px]">
                              {incomeVerified ? 'Verified' : 'Pending'}
                            </Tag>
                          </div>
                          <Input
                            placeholder="Income remarks (e.g. 6-month average salary LKR 185,000 verified with Hatton National Bank)..."
                            value={incomeRemarks}
                            onChange={(e) => setIncomeRemarks(e.target.value)}
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg mt-1 shadow-sm"
                          />
                        </div>

                        {/* Employment verification */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <Checkbox
                              checked={employmentVerified}
                              onChange={(e) => setEmploymentVerified(e.target.checked)}
                              className="text-slate-800 dark:text-slate-200 font-semibold text-xs"
                            >
                              Employment / Business Stability Confirmed
                            </Checkbox>
                            <Tag color={employmentVerified ? 'emerald' : 'default'} className="text-[11px]">
                              {employmentVerified ? 'Confirmed' : 'Pending'}
                            </Tag>
                          </div>
                          <Input
                            placeholder="Employment remarks (e.g. Confirmed permanent software engineer status with Apex Software HR)..."
                            value={employmentRemarks}
                            onChange={(e) => setEmploymentRemarks(e.target.value)}
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg mt-1 shadow-sm"
                          />
                        </div>

                        {/* Debt-to-income notes */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Debt-to-Income & Capacity Analysis Notes
                          </label>
                          <TextArea
                            rows={3}
                            placeholder="Analyze disposable income, existing borrowings, living costs, and repayment margin..."
                            value={dtiNotes}
                            onChange={(e) => setDtiNotes(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg shadow-sm"
                          />
                        </div>

                        {/* CRIB credit history notes */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            CRIB Report & Credit History Evaluation
                          </label>
                          <TextArea
                            rows={3}
                            placeholder="CRIB score, historical delinquency, inquiries in last 6 months, settling records..."
                            value={cribNotes}
                            onChange={(e) => setCribNotes(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg shadow-sm"
                          />
                        </div>

                        {/* Collateral notes */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Collateral, Guarantor & Security Adequacy Notes
                          </label>
                          <TextArea
                            rows={3}
                            placeholder="Appraisal of vehicle inspection value, guarantor asset backing, down payment buffer..."
                            value={collateralNotes}
                            onChange={(e) => setCollateralNotes(e.target.value)}
                            className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Right Column: Risk Scoring & Sanction Actions */}
                  <Col xs={24} lg={8}>
                    <div className="space-y-6">
                      {/* Risk Level Card */}
                      <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-lg">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Risk Grading & Recommendation
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                              Overall Risk Level
                            </label>
                            <Radio.Group
                              value={riskLevel}
                              onChange={(e) => setRiskLevel(e.target.value)}
                              className="w-full flex gap-2"
                            >
                              <Radio.Button
                                value="LOW"
                                className={`flex-1 text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                                  riskLevel === 'LOW'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                Low Risk
                              </Radio.Button>
                              <Radio.Button
                                value="MEDIUM"
                                className={`flex-1 text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                                  riskLevel === 'MEDIUM'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                Medium Risk
                              </Radio.Button>
                              <Radio.Button
                                value="HIGH"
                                className={`flex-1 text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                                  riskLevel === 'HIGH'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}
                              >
                                High Risk
                              </Radio.Button>
                            </Radio.Group>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                              Recommended Action
                            </label>
                            <Select
                              value={recommendation}
                              onChange={(val) => setRecommendation(val)}
                              className="w-full text-xs"
                            >
                              <Option value="APPROVE">Approve Facility</Option>
                              <Option value="REFER_TO_SENIOR">Refer to Senior Manager</Option>
                              <Option value="REJECT">Reject Application</Option>
                            </Select>
                          </div>

                          <Button
                            onClick={handleSaveAssessment}
                            loading={submitting}
                            icon={<Save className="w-4 h-4" />}
                            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-semibold text-xs h-9 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            Save Assessment Draft
                          </Button>
                        </div>
                      </Card>

                      {/* Sanction Decision Panel */}
                      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50/40 dark:from-slate-900 dark:to-purple-950/40 border border-purple-200 dark:border-purple-500/30 rounded-2xl shadow-sm dark:shadow-xl">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          Final Underwriting Sanction
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                          Execute formal approval, referral or rejection. High-value requests automatically route to Senior Management.
                        </p>

                        {isHighValue && (
                          <Alert
                            type="warning"
                            showIcon
                            className="mb-4 text-xs bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                            message="High-Value Sanction Notice"
                            description="Because this facility exceeds LKR 500,000, approving will automatically route the application to Senior Manager for executive authorization."
                          />
                        )}

                        <div className="space-y-2.5">
                          <Button
                            type="primary"
                            onClick={() => handleOpenDecisionModal('APPROVE')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-10 border-0 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isHighValue ? 'Approve & Escalate to Senior Manager' : 'Approve Application'}
                          </Button>

                          {!isHighValue && (
                            <Button
                              onClick={() => handleOpenDecisionModal('REFER')}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 border-0 flex items-center justify-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Manual Referral to Senior Manager
                            </Button>
                          )}

                          <Button
                            danger
                            onClick={() => handleOpenDecisionModal('REJECT')}
                            className="w-full font-bold text-xs h-10 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Application
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'guarantors',
            label: (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Users className="w-4 h-4" /> Guarantor Verification
                <Tag color="purple" className="ml-1 text-[10px] font-bold">
                  {application.guarantors?.length || 0}
                </Tag>
              </span>
            ),
            children: (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Guarantor Risk Appraisal</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verify individual guarantor background, CRIB status, and employment solvency
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {application.guarantors?.map((g) => (
                    <Card
                      key={g.id}
                      className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">{g.fullName}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">NIC: {g.nic}</span>
                          </div>
                          <StatusBadge status={g.verificationStatus} />
                        </div>

                        <Divider className="my-2 border-slate-200 dark:border-slate-800" />

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Relationship:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-semibold">{g.relationship}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Monthly Income:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              LKR {Number(g.monthlyIncome || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                            <span className="text-slate-700 dark:text-slate-200">{g.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Employer:</span>
                            <span className="text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{g.employerName || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Address:</span>
                            <span className="text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{g.address}</span>
                          </div>
                          {g.verificationRemarks && (
                            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-slate-500 dark:text-slate-400 block">Remarks:</span>
                              {g.verificationRemarks}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleOpenGuarantorModal(g)}
                          className="w-full bg-purple-600 hover:bg-purple-500 font-semibold text-xs h-8 border-0"
                        >
                          Update Verification Status
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            key: 'vehicle',
            label: (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Car className="w-4 h-4" /> Vehicle Inspection
                {application.vehicleInspection && (
                  <Tag color="emerald" className="ml-1 text-[10px] font-bold">Done</Tag>
                )}
              </span>
            ),
            children: (
              <div className="space-y-6 mt-4">
                {!isVehicleLease ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Not Applicable"
                    description="This application is a Money Loan facility. Physical vehicle inspections are only conducted for Vehicle Leasing applications."
                    className="border-blue-200 bg-blue-50/50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  />
                ) : application.vehicleInspection ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicle Specifications */}
                    <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Declared Vehicle Specs
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-500 dark:text-slate-400">Make & Model:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {application.vehicleLeaseDetail?.make} {application.vehicleLeaseDetail?.model}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-500 dark:text-slate-400">Year of Manufacture:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {application.vehicleLeaseDetail?.yearOfManufacture}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-500 dark:text-slate-400">Registration Number:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                            {application.vehicleLeaseDetail?.registrationNumber || 'UNREGISTERED'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-500 dark:text-slate-400">Category:</span>
                          <span className="text-slate-800 dark:text-slate-200">{application.vehicleLeaseDetail?.vehicleCategory}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-500 dark:text-slate-400">Condition:</span>
                          <span className="text-slate-800 dark:text-slate-200">{application.vehicleLeaseDetail?.vehicleCondition}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Inspection Findings */}
                    <Card className="lg:col-span-2 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Field Officer Valuation Report
                        </h4>
                        <Tag color="emerald" className="font-semibold text-xs">
                          Rating: {application.vehicleInspection.overallRating}
                        </Tag>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Estimated Market Value</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                            LKR {Number(application.vehicleInspection.estimatedMarketValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Forced Sale Value</span>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                            LKR {Number(application.vehicleInspection.forcedSaleValue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Recommended Loan Limit</span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            LKR {Number(application.vehicleInspection.recommendedValue || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Physical & Bodywork Condition:</span>
                          <span className="text-slate-700 dark:text-slate-200">{application.vehicleInspection.physicalCondition || 'Satisfactory'}</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Mechanical & Engine Condition:</span>
                          <span className="text-slate-700 dark:text-slate-200">{application.vehicleInspection.mechanicalCondition || 'Operational'}</span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Field Officer Remarks:</span>
                          <span className="text-slate-700 dark:text-slate-200">{application.vehicleInspection.remarks}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                          <span>Inspected By: {application.vehicleInspection.inspectedByName}</span>
                          <span>Date: {dayjs(application.vehicleInspection.inspectionDate).format('YYYY-MM-DD')}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <Car className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Vehicle Inspection Report Attached</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                      This Vehicle Lease application requires physical inspection and valuation by a Field Officer before final credit approval.
                    </p>
                    <Button
                      type="primary"
                      onClick={() => setInspectionModalVisible(true)}
                      className="bg-purple-600 hover:bg-purple-500 font-semibold text-xs h-9"
                    >
                      Request Field Inspection
                    </Button>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'documents',
            label: (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <FileText className="w-4 h-4" /> KYC Documents
                <Tag color="blue" className="ml-1 text-[10px] font-bold">
                  {application.documents?.length || 0}
                </Tag>
              </span>
            ),
            children: (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {application.documents?.map((doc) => (
                  <Card key={doc.id} className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white text-xs block">{doc.originalFilename}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{doc.documentType}</span>
                      </div>
                      <StatusBadge status={doc.verificationStatus} />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: 'history',
            label: (
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Clock className="w-4 h-4" /> Status History
              </span>
            ),
            children: (
              <div className="p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl mt-4 shadow-sm">
                <StatusTimeline history={application.statusHistory} />
              </div>
            ),
          },
        ]}
      />

      {/* Decision Confirmation Modal */}
      <Modal
        title={
          <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            {decisionType === 'APPROVE'
              ? isHighValue
                ? 'Approve & Escalate to Senior Manager'
                : 'Confirm Facility Approval'
              : decisionType === 'REFER'
              ? 'Refer to Senior Manager for Sanction'
              : 'Confirm Application Rejection'}
          </span>
        }
        open={decisionModalVisible}
        onCancel={() => setDecisionModalVisible(false)}
        onOk={handleConfirmDecision}
        confirmLoading={submitting}
        okText={decisionType === 'REJECT' ? 'Confirm Rejection' : 'Submit Decision'}
        okButtonProps={{
          danger: decisionType === 'REJECT',
          className: decisionType !== 'REJECT' ? 'bg-purple-600 hover:bg-purple-500 font-semibold' : '',
        }}
      >
        <div className="space-y-4 py-3">
          {decisionType === 'APPROVE' && isHighValue && (
            <Alert
              type="info"
              showIcon
              message="Threshold Escalation"
              description="Facility requested amount (LKR 1,500,000) exceeds LKR 500,000 threshold. It will move to PENDING_SENIOR_APPROVAL."
            />
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {decisionType === 'REJECT' ? 'Mandatory Rejection Reason *' : 'Underwriting Notes & Decision Remarks'}
            </label>
            <TextArea
              rows={4}
              placeholder={
                decisionType === 'REJECT'
                  ? 'Specify clear regulatory or financial justification for rejection...'
                  : 'Enter any sanction covenants, conditions, or appraisal remarks...'
              }
              value={decisionRemarks}
              onChange={(e) => setDecisionRemarks(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Request Inspection Modal */}
      <Modal
        title={<span className="text-base font-bold text-slate-900 dark:text-white">Request Field Vehicle Inspection</span>}
        open={inspectionModalVisible}
        onCancel={() => setInspectionModalVisible(false)}
        onOk={handleRequestInspection}
        confirmLoading={submitting}
        okText="Dispatch Inspection Request"
        okButtonProps={{ className: 'bg-purple-600 hover:bg-purple-500 font-semibold' }}
      >
        <div className="space-y-3 py-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This will assign the vehicle lease inspection task to the Field Officers queue (status: <code className="text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/50 px-1 py-0.5 rounded">PENDING_FIELD_INSPECTION</code>).
          </p>
          <TextArea
            rows={3}
            placeholder="Inspection instructions or notes for Field Officer (e.g. Inspect at dealer showroom in Kelaniya)..."
            value={inspectionRemarks}
            onChange={(e) => setInspectionRemarks(e.target.value)}
            className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg"
          />
        </div>
      </Modal>

      {/* Guarantor Verification Modal */}
      <Modal
        title={<span className="text-base font-bold text-slate-900 dark:text-white">{`Verify Guarantor: ${selectedGuarantor?.fullName || ''}`}</span>}
        open={guarantorModalVisible}
        onCancel={() => setGuarantorModalVisible(false)}
        onOk={handleConfirmGuarantorVerify}
        confirmLoading={submitting}
        okText="Save Verification"
        okButtonProps={{ className: 'bg-purple-600 hover:bg-purple-500 font-semibold' }}
      >
        <div className="space-y-4 py-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Verification Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGuarantorStatus('VERIFIED')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer ${
                  guarantorStatus === 'VERIFIED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${guarantorStatus === 'VERIFIED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>Verified / Acceptable</span>
              </button>

              <button
                type="button"
                onClick={() => setGuarantorStatus('REJECTED')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer ${
                  guarantorStatus === 'REJECTED'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm ring-2 ring-rose-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <XCircle className={`w-4 h-4 ${guarantorStatus === 'REJECTED' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                <span>Reject Guarantor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Officer Notes / CRIB remarks</label>
            <TextArea
              rows={3}
              placeholder="e.g. Verified salary slip, CRIB score 720, confirmed residential address via utility bill..."
              value={guarantorRemarks}
              onChange={(e) => setGuarantorRemarks(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditAssessmentPage;
