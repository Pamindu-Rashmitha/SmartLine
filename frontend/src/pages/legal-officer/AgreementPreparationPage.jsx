import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  Tag,
  Divider,
  message,
  Modal,
  Spin,
  Tooltip,
} from 'antd';
import {
  Scale,
  ArrowLeft,
  FileCheck2,
  FileSignature,
  FileDown,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  Building,
  Car,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import agreementApi from '../../api/agreementApi';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { TextArea } = Input;

const STANDARD_TEMPLATES = {
  microfinance:
    '1. The Borrower undertakes to repay the total payable amount in equal monthly installments on or before the due date specified in the facility schedule.\n' +
    '2. Any delay beyond 30 days shall incur default handling fees and statutory default interest.\n' +
    '3. Smart Line Investment (Pvt) Ltd reserves the right to declare the entire outstanding facility immediately due and payable upon persistent default.\n' +
    '4. The Borrower confirms all financial, identity, and residential information furnished to the Lender remains truthful and accurate.',
  vehicleLease:
    '1. Ownership of the leased vehicle remains vested exclusively in Smart Line Investment (Pvt) Ltd until all monthly installments, down-payment, and residual charges are settled in full.\n' +
    '2. The Lessee shall maintain comprehensive motor insurance covering the leased asset throughout the tenor, assigning Smart Line Investment as the primary absolute owner.\n' +
    '3. Sub-leasing, unauthorized modification, or transfer of the leased vehicle without written consent is strictly prohibited and constitutes grounds for immediate repossession.',
  guarantorCovenant:
    'The Guarantor(s) hereby unconditionally and irrevocably guarantee the punctual payment and discharge of all borrower obligations under this agreement as joint and primary obligors.',
};

const sanitizeText = (val) => {
  if (!val || val === 'null' || val === 'undefined') return '-';
  return val;
};

const AgreementPreparationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [agreement, setAgreement] = useState(null);

  // Form State
  const [downPaymentRequired, setDownPaymentRequired] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState(STANDARD_TEMPLATES.microfinance);
  const [specialConditions, setSpecialConditions] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const appRes = await applicationApi.getApplicationById(id);
      if (appRes.data) {
        setApplication(appRes.data);

        // Pre-fill terms if vehicle lease
        if (appRes.data.type === 'VEHICLE_LEASE') {
          setTermsAndConditions(STANDARD_TEMPLATES.vehicleLease);
          if (appRes.data.vehicleLeaseDetail?.downPaymentAmount) {
            setDownPaymentRequired(Number(appRes.data.vehicleLeaseDetail.downPaymentAmount));
          }
        }
      }

      // Check if agreement already prepared
      try {
        const agRes = await agreementApi.getAgreementByApplication(id);
        if (agRes.data) {
          setAgreement(agRes.data);
          setDownPaymentRequired(Number(agRes.data.downPaymentRequired || 0));
          if (agRes.data.termsAndConditions) {
            setTermsAndConditions(agRes.data.termsAndConditions);
          }
          if (agRes.data.specialConditions) {
            setSpecialConditions(agRes.data.specialConditions);
          }
        }
      } catch (err) {
        // No agreement prepared yet - perfectly fine
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      message.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const payload = {
        downPaymentRequired: downPaymentRequired || 0,
        termsAndConditions,
        specialConditions,
      };
      const res = await agreementApi.prepareAgreement(id, payload);
      setAgreement(res.data);
      message.success('Draft agreement saved successfully');
      fetchData();
    } catch (err) {
      console.error('Failed to save agreement draft:', err);
      message.error(err.response?.data?.message || 'Failed to save draft agreement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAgreement = async () => {
    Modal.confirm({
      title: <span className="text-slate-900 dark:text-white font-bold">Verify & Seal Legal Agreement</span>,
      content: (
        <div className="space-y-2 text-slate-700 dark:text-slate-300">
          <p>
            You are about to legally verify and seal agreement{' '}
            <strong className="text-blue-600 dark:text-blue-400 font-mono">
              {agreement?.agreementNumber || `AGR-2026-${String(id).padStart(5, '0')}`}
            </strong>
            .
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono space-y-1 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div>Principal: LKR {Number(application?.requestedAmount || 0).toLocaleString()}</div>
            <div>
              Down-Payment: LKR {Number(downPaymentRequired || 0).toLocaleString()}{' '}
              {downPaymentRequired > 0 ? '(Pending Receipt)' : '(Waived / Zero)'}
            </div>
            <div>
              Next Workflow Stage:{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {downPaymentRequired > 0 ? 'PENDING_DOWN_PAYMENT' : 'PENDING_DISBURSAL'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This action generates the final legal seal and moves the facility to Finance Officer execution.
          </p>
        </div>
      ),
      okText: 'Confirm & Seal Agreement',
      cancelText: 'Cancel',
      okButtonProps: { className: 'bg-emerald-600 hover:bg-emerald-500 font-semibold border-none' },
      onOk: async () => {
        setSubmitting(true);
        try {
          // Save draft first to capture any edits
          await agreementApi.prepareAgreement(id, {
            downPaymentRequired: downPaymentRequired || 0,
            termsAndConditions,
            specialConditions,
          });

          const res = await agreementApi.verifyAgreement(id);
          setAgreement(res.data);
          message.success('Agreement verified and legally sealed!');
          fetchData();
        } catch (err) {
          console.error('Failed to verify agreement:', err);
          message.error(err.response?.data?.message || 'Failed to verify agreement');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleDownloadPdf = async () => {
    if (!agreement?.id) {
      message.warning('Please save the agreement draft before downloading PDF');
      return;
    }
    try {
      message.loading({ content: 'Generating official agreement PDF...', key: 'pdf' });
      const blob = await agreementApi.downloadAgreementPdf(agreement.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Agreement_${agreement.agreementNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success({ content: 'Agreement PDF downloaded successfully', key: 'pdf' });
    } catch (err) {
      console.error('Failed to download PDF:', err);
      message.error({ content: 'Failed to generate agreement PDF', key: 'pdf' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Loading application and legal agreement dossier..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-slate-300">Application not found</h2>
        <Button onClick={() => navigate('/legal-agreements')}>Back to Legal Pipeline</Button>
      </div>
    );
  }

  const isVerified = agreement?.status === 'VERIFIED';
  const ld = application.loanDetail;
  const vld = application.vehicleLeaseDetail;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
            onClick={() => navigate('/legal-agreements')}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
                Legal Agreement Preparation & Attestation
              </h1>
              <StatusBadge status={application.status} />
              {agreement && (
                <Tag color={isVerified ? 'success' : 'warning'} className="font-mono text-xs">
                  {agreement.agreementNumber} ({agreement.status})
                </Tag>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-0">
              Ref: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{application.applicationNumber}</span> |
              Borrower: <span className="text-slate-800 dark:text-slate-200 font-semibold">{application.applicantName}</span> (NIC: {application.applicantNic})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {agreement && (
            <Button
              icon={<FileDown className="w-4 h-4" />}
              onClick={handleDownloadPdf}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-medium shadow-sm"
            >
              Download PDF Agreement
            </Button>
          )}

          {!isVerified && (
            <>
              <Button
                icon={<FileSignature className="w-4 h-4" />}
                loading={submitting}
                onClick={handleSaveDraft}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-medium shadow-sm"
              >
                Save Draft
              </Button>
              <Button
                type="primary"
                icon={<FileCheck2 className="w-4 h-4" />}
                loading={submitting}
                onClick={handleVerifyAgreement}
                className="bg-emerald-600 hover:bg-emerald-500 border-none flex items-center gap-1.5 text-xs font-medium shadow-lg shadow-emerald-600/30"
              >
                Verify & Seal Agreement
              </Button>
            </>
          )}

          {isVerified && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Agreement Sealed on {dayjs(agreement.verifiedDate).format('DD MMM YYYY, HH:mm')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Dossier */}
      <Row gutter={[20, 20]}>
        {/* Left Column: Customer & Approved Facility Specs */}
        <Col xs={24} lg={9} className="space-y-5">
          {/* Customer Summary Card */}
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Borrower Particulars</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
          >
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{application.applicantName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">National ID (NIC)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{application.applicantNic}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Contact Phone</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{sanitizeText(application.applicantPhone)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Monthly Income</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  LKR {Number(application.applicantMonthlyIncome || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Employer / Business</span>
                <span className="text-slate-800 dark:text-slate-200">{sanitizeText(application.applicantEmployer)}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Residential Address</span>
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{sanitizeText(application.applicantAddress)}</span>
              </div>
            </div>
          </Card>

          {/* Approved Terms Summary */}
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Approved Facility Terms</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
          >
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Facility Type</span>
                <Tag color={application.type === 'VEHICLE_LEASE' ? 'orange' : 'blue'}>
                  {application.type === 'VEHICLE_LEASE' ? 'Vehicle Lease' : 'Money Loan'}
                </Tag>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Principal Financing</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  LKR {Number(application.requestedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Agreed Interest Rate</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  {ld?.proposedInterestRate || vld?.proposedInterestRate || 14.0}% p.a.
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Repayment Tenor</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  {ld?.requestedTenure || vld?.requestedTenure || 12} Months
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Monthly Installment (EMI)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">
                  LKR {Number(ld?.calculatedMonthlyEmi || vld?.calculatedMonthlyEmi || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Gross Total Repayable</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">
                  LKR {Number(ld?.calculatedTotalRepayable || vld?.calculatedTotalRepayable || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Vehicle Particulars if Lease */}
          {application.type === 'VEHICLE_LEASE' && vld && (
            <Card
              title={
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                  <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Leased Asset Particulars</span>
                </div>
              }
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Asset</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {vld.make} {vld.model} ({vld.yearOfManufacture || vld.year})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Category / Condition</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {vld.vehicleCategory} | {vld.vehicleCondition}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Registration Number</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {vld.registrationNumber || 'UNREGISTERED'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Market Valuation</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">
                    LKR {Number(vld.estimatedMarketValue || vld.marketValue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Guarantor Undertaking */}
          {application.guarantors && application.guarantors.length > 0 && (
            <Card
              title={
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Guarantor Undertaking ({application.guarantors.length})</span>
                </div>
              }
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
            >
              <div className="space-y-3">
                {application.guarantors.map((g, idx) => (
                  <div key={g.id || idx} className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{g.fullName}</span>
                      <Tag color="cyan" className="m-0 text-[10px]">
                        {g.relationship || 'Guarantor'}
                      </Tag>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">NIC: {g.nic}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Income: LKR {Number(g.monthlyIncome || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        {/* Right Column: Legal Clauses & Covenants Editor */}
        <Col xs={24} lg={15} className="space-y-5">
          {/* Down-Payment Requirement Configuration */}
          <Card
            title={
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Pre-Disbursal Down-Payment Requirement</span>
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Specify the upfront cash down-payment required from the borrower prior to facility disbursal. Enter{' '}
                <strong className="text-slate-800 dark:text-slate-200">0</strong> if down-payment is waived or not applicable.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <InputNumber
                    disabled={isVerified}
                    value={downPaymentRequired}
                    onChange={(val) => setDownPaymentRequired(val || 0)}
                    min={0}
                    step={5000}
                    className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-base rounded-lg shadow-sm"
                    formatter={(value) => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\LKR\s?|(,*)/g, '')}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {downPaymentRequired > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Will require Finance Officer down-payment confirmation
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Facility will bypass down-payment desk straight to disbursal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Standard Terms & Covenants */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                  <FileSignature className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Standard Legal Covenants & Terms</span>
                </div>
                {!isVerified && (
                  <div className="flex items-center gap-2">
                    <Tooltip title="Reset to standard microfinance covenants">
                      <Button
                        size="small"
                        type="dashed"
                        onClick={() => setTermsAndConditions(STANDARD_TEMPLATES.microfinance)}
                        className="text-[11px] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800"
                      >
                        Loan Template
                      </Button>
                    </Tooltip>
                    <Tooltip title="Reset to vehicle lease covenants">
                      <Button
                        size="small"
                        type="dashed"
                        onClick={() => setTermsAndConditions(STANDARD_TEMPLATES.vehicleLease)}
                        className="text-[11px] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800"
                      >
                        Lease Template
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
          >
            <div className="space-y-3">
              <TextArea
                disabled={isVerified}
                rows={8}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono leading-relaxed rounded-lg shadow-sm"
                placeholder="Enter standard legal clauses and default terms..."
              />
            </div>
          </Card>

          {/* Special Conditions / Covenants */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Special Conditions & Bespoke Covenants</span>
                </div>
                {!isVerified && (
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() =>
                      setSpecialConditions(
                        (prev) =>
                          (prev ? prev + '\n\n' : '') + STANDARD_TEMPLATES.guarantorCovenant
                      )
                    }
                    className="text-[11px] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800"
                  >
                    + Add Guarantor Clause
                  </Button>
                )}
              </div>
            }
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg rounded-2xl"
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional: Enter facility-specific covenants, additional collateral pledges, or pre-conditions agreed during underwriting.
              </p>
              <TextArea
                disabled={isVerified}
                rows={4}
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono leading-relaxed rounded-lg shadow-sm"
                placeholder="e.g. Borrower agrees to submit bi-annual audited statements; hypothecation of vehicle registration book No. WP AAX-8932 to Smart Line..."
              />
            </div>
          </Card>

          {/* Verification Attestation Footer */}
          {isVerified && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-200">
                    Official Agreement Attestation Complete
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Agreement {agreement?.agreementNumber} is verified and sealed. A copy is available in the applicant's portal.
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                icon={<FileDown className="w-4 h-4" />}
                onClick={handleDownloadPdf}
                className="bg-emerald-600 hover:bg-emerald-500 border-none font-medium text-xs"
              >
                Download Sealed PDF
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AgreementPreparationPage;
