import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps,
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Upload,
  message,
  Modal,
  Tag,
  Divider,
  Row,
  Col,
  Result,
  Alert,
} from 'antd';
import {
  Wallet,
  Car,
  FileText,
  UserCheck,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Paperclip,
  Check,
  AlertCircle,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoanCalculatorWidget, { calculateFlatEmi } from '../../components/application/LoanCalculatorWidget';
import applicationApi from '../../api/applicationApi';
import documentApi from '../../api/documentApi';

const { Option } = Select;
const { Dragger } = Upload;

const REQUIRED_DOCUMENTS = {
  LOAN: [
    { type: 'NIC_FRONT', label: 'National ID (Front)', description: 'Clear photo or scan of your NIC front' },
    { type: 'NIC_BACK', label: 'National ID (Back)', description: 'Clear photo or scan of your NIC back' },
    { type: 'SALARY_SLIP', label: 'Recent Pay Slip', description: 'Latest 3 months salary slip' },
    { type: 'BANK_STATEMENT', label: 'Bank Statement', description: 'Past 6 months active bank account statement' },
    { type: 'UTILITY_BILL', label: 'Billing / Address Proof', description: 'Electricity or water bill matching your address' },
  ],
  VEHICLE_LEASE: [
    { type: 'NIC_FRONT', label: 'National ID (Front)', description: 'Clear photo or scan of your NIC front' },
    { type: 'NIC_BACK', label: 'National ID (Back)', description: 'Clear photo or scan of your NIC back' },
    { type: 'SALARY_SLIP', label: 'Proof of Income', description: 'Salary slip or business income proof' },
    { type: 'BANK_STATEMENT', label: 'Bank Statement', description: 'Past 6 months active bank statement' },
    { type: 'VEHICLE_REGISTRATION', label: 'Vehicle Invoice / CR', description: 'Dealer proforma invoice or vehicle book' },
  ],
};

const ApplyLoanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Form State
  const [facilityType, setFacilityType] = useState('LOAN'); // 'LOAN' or 'VEHICLE_LEASE'
  const [amount, setAmount] = useState(600000);
  const [tenure, setTenure] = useState(24);
  const [interestRate, setInterestRate] = useState(14.5);

  // Facility Details
  const [form] = Form.useForm();

  // Guarantors State
  const [guarantors, setGuarantors] = useState([
    {
      fullName: '',
      nic: '',
      phone: '',
      relationship: 'Close Relative',
      address: '',
      occupation: 'Private Executive',
      employerName: 'Commercial Firm',
      monthlyIncome: 95000,
    },
  ]);
  const [guarantorModalVisible, setGuarantorModalVisible] = useState(false);
  const [guarantorForm] = Form.useForm();

  // Documents State: maps documentType -> File object
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Step 0: Facility Choice
  const handleFacilitySelect = (type) => {
    setFacilityType(type);
    if (type === 'LOAN') {
      setAmount(600000);
      setTenure(24);
      setInterestRate(14.5);
    } else {
      setAmount(1200000);
      setTenure(36);
      setInterestRate(15.0);
    }
  };

  // Add Guarantor
  const handleAddGuarantor = (values) => {
    setGuarantors([...guarantors, values]);
    guarantorForm.resetFields();
    setGuarantorModalVisible(false);
    message.success('Guarantor added to application profile');
  };

  const handleRemoveGuarantor = (index) => {
    if (guarantors.length <= 1) {
      message.warning('At least one guarantor is required for the application');
      return;
    }
    const updated = guarantors.filter((_, i) => i !== index);
    setGuarantors(updated);
  };

  // Document Upload Handlers
  const handleFileChange = (docType, file) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docType]: file,
    }));
    message.success(`${file.name} staged for upload`);
    return false; // Prevent automatic upload
  };

  const handleRemoveFile = (docType) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
  };

  // Next Step Validation
  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        await form.validateFields();
      } else if (currentStep === 2) {
        if (guarantors.length === 0 || !guarantors[0].fullName || !guarantors[0].nic) {
          message.error('Please provide at least one valid guarantor');
          return;
        }
      }
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      message.error('Please complete all required fields with valid information');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Final Submit Handler
  const handleSubmitApplication = async (submitImmediately = true) => {
    setSubmitting(true);
    try {
      const formValues = form.getFieldsValue();

      const payload = {
        type: facilityType,
        requestedAmount: amount,
        purpose: formValues.purpose || 'Personal financing',
        submitImmediately,
        guarantors: guarantors.filter((g) => g.fullName && g.nic),
      };

      if (facilityType === 'LOAN') {
        payload.loanDetail = {
          loanPurpose: formValues.purpose || 'Personal financing',
          requestedTenure: tenure,
          proposedInterestRate: interestRate,
          existingLoans: formValues.existingLoans || 'None',
          totalExistingDebt: formValues.totalExistingDebt || 0,
        };
      } else {
        payload.vehicleLeaseDetail = {
          vehicleCategory: formValues.vehicleCategory || 'MOTORCYCLE',
          make: formValues.make || 'Yamaha',
          model: formValues.model || 'FZ-S',
          yearOfManufacture: formValues.yearOfManufacture || 2024,
          registrationNumber: formValues.registrationNumber,
          engineNumber: formValues.engineNumber,
          chassisNumber: formValues.chassisNumber,
          color: formValues.color,
          vehicleCondition: formValues.vehicleCondition || 'NEW',
          estimatedMarketValue: formValues.estimatedMarketValue || amount,
          downPaymentAmount: formValues.downPaymentAmount || 0,
          requestedTenure: tenure,
          proposedInterestRate: interestRate,
          dealerName: formValues.dealerName,
          dealerContact: formValues.dealerContact,
        };
      }

      // 1. Create Application
      const appResponse = await applicationApi.createApplication(payload);
      const createdApp = appResponse.data;

      // 2. Upload staged files if any
      const docEntries = Object.entries(uploadedFiles);
      if (docEntries.length > 0) {
        for (const [docType, file] of docEntries) {
          try {
            await documentApi.uploadDocument(createdApp.id, docType, file);
          } catch (uploadErr) {
            console.error(`Failed to upload ${docType}:`, uploadErr);
          }
        }
      }

      setSubmittedApp(createdApp);
      setCurrentStep(4); // Success step
      message.success(submitImmediately ? 'Application submitted successfully!' : 'Application saved as draft!');
    } catch (error) {
      console.error('Submission error:', error);
      const errMsg = error.response?.data?.message || 'Failed to submit application. Please verify details.';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: 'Facility Choice', icon: <Wallet className="w-4 h-4" /> },
    { title: 'Financing Terms', icon: <FileText className="w-4 h-4" /> },
    { title: 'Guarantor Details', icon: <UserCheck className="w-4 h-4" /> },
    { title: 'Document Vault', icon: <UploadCloud className="w-4 h-4" /> },
    { title: 'Confirmation', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const requiredDocList = REQUIRED_DOCUMENTS[facilityType] || REQUIRED_DOCUMENTS.LOAN;

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30">
              <FileCheck className="w-6 h-6" />
            </span>
            Apply for Loan or Vehicle Lease
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Complete the 5-step digital application for instant underwriting processing
          </p>
        </div>
        <Tag color="blue" className="text-xs px-3 py-1 font-mono uppercase tracking-wider">
          Borrower: {user?.fullName || 'Applicant'}
        </Tag>
      </div>

      {/* Stepper Progress */}
      <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
        <Steps
          current={currentStep}
          items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
          className="custom-stepper"
        />
      </Card>

      {/* Step Content */}
      <div className="min-h-[480px]">
        {/* STEP 0: FACILITY SELECTION */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 text-center">Select Your Financing Facility</h3>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div
                  onClick={() => handleFacilitySelect('LOAN')}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full ${
                    facilityType === 'LOAN'
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 shadow-md dark:shadow-2xl dark:shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {facilityType === 'LOAN' && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                      <Wallet className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Money Loan Facility</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Unsecured or guarantor-backed liquid capital for personal, business expansion, home improvements,
                      or urgent financial commitments.
                    </p>
                    <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financing up to LKR 3,000,000
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Flexible tenure from 12 to 60 months
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Attractive flat rate from 14.5% p.a.
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Processing: 24-48 Hours</span>
                    <Button type={facilityType === 'LOAN' ? 'primary' : 'default'} shape="round">
                      Select Money Loan
                    </Button>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div
                  onClick={() => handleFacilitySelect('VEHICLE_LEASE')}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full ${
                    facilityType === 'VEHICLE_LEASE'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-500 shadow-md dark:shadow-2xl dark:shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {facilityType === 'VEHICLE_LEASE' && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                      <Car className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vehicle Leasing Facility</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Structured asset-backed financing tailored for motorcycles, three-wheelers, cars, and commercial
                      vehicles with customized down-payments.
                    </p>
                    <div className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Financing up to 80% of vehicle value
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Flexible tenure up to 72 months
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Fast-track field valuation approval
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Processing: 24-72 Hours</span>
                    <Button type={facilityType === 'VEHICLE_LEASE' ? 'primary' : 'default'} shape="round">
                      Select Vehicle Lease
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="flex justify-end pt-4">
              <Button type="primary" size="large" onClick={handleNext} className="flex items-center gap-2">
                Continue to Financing Terms <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1: FINANCING TERMS & PARAMETERS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <LoanCalculatorWidget
              amount={amount}
              tenure={tenure}
              rate={interestRate}
              onAmountChange={setAmount}
              onTenureChange={setTenure}
              minAmount={facilityType === 'LOAN' ? 50000 : 200000}
              maxAmount={facilityType === 'LOAN' ? 3000000 : 6000000}
              title={`${facilityType === 'LOAN' ? 'Loan' : 'Lease'} Repayment Structure Preview`}
            />

            <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                {facilityType === 'LOAN' ? 'Loan Specific Information' : 'Vehicle & Dealership Details'}
              </h4>

              <Form form={form} layout="vertical" initialValues={{ purpose: 'Personal financing', vehicleCategory: 'MOTORCYCLE', vehicleCondition: 'USED' }}>
                {facilityType === 'LOAN' ? (
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="purpose"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">Loan Purpose</span>}
                        rules={[{ required: true, message: 'Please specify purpose' }]}
                      >
                        <Select className="custom-select" placeholder="Select purpose">
                          <Option value="Home Renovation">Home Renovation / Solar</Option>
                          <Option value="Business Capital">Business Working Capital</Option>
                          <Option value="Education">Higher Education Expenses</Option>
                          <Option value="Medical">Medical / Emergency</Option>
                          <Option value="Debt Consolidation">Consolidation of High-Interest Debts</Option>
                          <Option value="Other">Other Personal Purpose</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="totalExistingDebt"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">Total Existing Loans / Credit Card Debts (LKR)</span>}
                      >
                        <InputNumber
                          className="w-full"
                          min={0}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="existingLoans" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Existing Bank / Finance Institution Details</span>}>
                        <Input.TextArea rows={2} placeholder="e.g. Commercial Bank Credit Card (LKR 100k limit)" />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="vehicleCategory"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">Vehicle Category</span>}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="Category">
                          <Option value="MOTORCYCLE">Motorcycle (Bike)</Option>
                          <Option value="THREE_WHEELER">Three-Wheeler (Tuk Tuk)</Option>
                          <Option value="CAR">Passenger Car</Option>
                          <Option value="VAN">Dual-Purpose Van</Option>
                          <Option value="TRUCK">Light Commercial Truck</Option>
                          <Option value="OTHER">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="make" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Make (Brand)</span>} rules={[
                        { required: true, message: 'Make is required' },
                        { min: 2, message: 'Make must be at least 2 characters' },
                      ]}>
                        <Input placeholder="e.g. Yamaha, Honda, Suzuki" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="model" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Model</span>} rules={[
                        { required: true, message: 'Model is required' },
                        { min: 2, message: 'Model must be at least 2 characters' },
                      ]}>
                        <Input placeholder="e.g. FZ-S, Alto, WagonR" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name="yearOfManufacture"
                        label={<span className="text-slate-700 dark:text-slate-300 font-medium">Year of Manufacture</span>}
                        rules={[{ required: true }]}
                        initialValue={2023}
                      >
                        <InputNumber min={1980} max={new Date().getFullYear() + 1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="estimatedMarketValue" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Total Vehicle Value (LKR)</span>} rules={[{ required: true }]}>
                        <InputNumber
                          className="w-full"
                          min={100000}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          placeholder="1,500,000"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="downPaymentAmount" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Customer Down Payment (LKR)</span>}>
                        <InputNumber
                          className="w-full"
                          min={0}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          placeholder="300,000"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item name="registrationNumber" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Registration # (If registered)</span>}>
                        <Input placeholder="e.g. WP BHY-4820 or UNREGISTERED" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                      <Form.Item name="dealerName" label={<span className="text-slate-700 dark:text-slate-300 font-medium">Dealer / Seller Name</span>}>
                        <Input placeholder="e.g. City Motors Plaza / Individual Seller" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Form>
            </Card>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} size="large" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button type="primary" size="large" onClick={handleNext} className="flex items-center gap-2">
                Proceed to Guarantor Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: GUARANTORS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">Guarantor Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Minimum 1 guarantor required (up to 3 maximum)</p>
              </div>
              {guarantors.length < 3 && (
                <Button
                  type="dashed"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setGuarantorModalVisible(true)}
                  className="border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:border-blue-500"
                >
                  Add Another Guarantor
                </Button>
              )}
            </div>

            <Row gutter={[16, 16]}>
              {guarantors.map((g, idx) => (
                <Col xs={24} md={12} key={idx}>
                  <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl relative shadow-sm dark:shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          G{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-semibold text-sm m-0">{g.fullName || 'Primary Guarantor'}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{g.relationship}</span>
                        </div>
                      </div>
                      {guarantors.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveGuarantor(idx)}
                        />
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">NIC Number:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{g.nic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Contact Phone:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{g.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Occupation / Employer:</span>
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{g.occupation} ({g.employerName})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Monthly Net Income:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          LKR {Number(g.monthlyIncome || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} size="large" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button type="primary" size="large" onClick={handleNext} className="flex items-center gap-2">
                Proceed to Document Vault <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal to Add Guarantor */}
            <Modal
              title={<span className="text-slate-900 dark:text-white">Add Loan Guarantor</span>}
              open={guarantorModalVisible}
              onCancel={() => setGuarantorModalVisible(false)}
              onOk={() => guarantorForm.submit()}
              okText="Add Guarantor"
            >
              <Form form={guarantorForm} layout="vertical" onFinish={handleAddGuarantor} className="mt-4">
                <Form.Item name="fullName" label="Guarantor Full Name" rules={[
                  { required: true, message: 'Full name is required' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                  { pattern: /^[a-zA-Z\s.'-]+$/, message: 'Name can only contain letters, spaces, and hyphens' },
                ]}>
                  <Input placeholder="e.g. Sunil Kumara" />
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="nic" label="NIC Number" rules={[
                      { required: true, message: 'NIC is required' },
                      { pattern: /^([0-9]{9}[vVxX]|[0-9]{12})$/, message: 'Enter valid NIC (e.g. 199512345678 or 951234567V)' },
                    ]}>
                      <Input placeholder="198512301234 or 851234567V" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="phone" label="Phone Number" rules={[
                      { required: true, message: 'Phone number is required' },
                      { pattern: /^(\+94|0)[0-9]{9}$/, message: 'Enter valid Sri Lankan phone (e.g. +94771234567)' },
                    ]}>
                      <Input placeholder="+94771234567" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="relationship" label="Relationship" rules={[{ required: true }]}>
                      <Select placeholder="Relationship">
                        <Option value="Spouse">Spouse</Option>
                        <Option value="Parent">Parent</Option>
                        <Option value="Sibling">Sibling</Option>
                        <Option value="Colleague">Work Colleague</Option>
                        <Option value="Close Relative">Close Relative</Option>
                        <Option value="Business Partner">Business Partner</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="monthlyIncome" label="Monthly Income (LKR)" rules={[
                      { required: true, message: 'Monthly income is required' },
                      { type: 'number', min: 1, message: 'Income must be greater than zero' },
                      { type: 'number', max: 50000000, message: 'Income cannot exceed LKR 50,000,000' },
                    ]}>
                      <InputNumber className="w-full" min={1} max={50000000} placeholder="85,000" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="employerName" label="Employer / Company Name">
                  <Input placeholder="e.g. Sri Lanka Telecom" />
                </Form.Item>
                <Form.Item name="address" label="Residential Address" rules={[
                  { required: true, message: 'Address is required' },
                  { min: 10, message: 'Please enter a complete address (at least 10 characters)' },
                ]}>
                  <Input.TextArea rows={2} placeholder="No. 12, Temple Road, Colombo" />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        )}

        {/* STEP 3: DOCUMENT VAULT */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">Document Vault</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Upload clear scanned copies or photos (PDF, PNG, JPG under 5MB)</p>
              </div>
              <Tag color="cyan">{Object.keys(uploadedFiles).length} / {requiredDocList.length} Uploaded</Tag>
            </div>

            <Row gutter={[16, 16]}>
              {requiredDocList.map((doc) => {
                const file = uploadedFiles[doc.type];
                return (
                  <Col xs={24} md={12} key={doc.type}>
                    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl h-full flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {doc.label}
                          </span>
                          {file ? (
                            <Tag color="success" icon={<Check className="w-3 h-3 inline" />}>Ready</Tag>
                          ) : (
                            <Tag color="warning">Mandatory</Tag>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{doc.description}</p>
                      </div>

                      {file ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <div className="truncate max-w-[220px]">
                            <p className="text-xs font-medium text-slate-900 dark:text-white truncate m-0">{file.name}</p>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleRemoveFile(doc.type)}
                          />
                        </div>
                      ) : (
                        <Upload
                          beforeUpload={(f) => handleFileChange(doc.type, f)}
                          showUploadList={false}
                          accept=".pdf,.png,.jpg,.jpeg,.webp"
                        >
                          <Button icon={<UploadCloud className="w-4 h-4" />} block className="border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500">
                            Select File
                          </Button>
                        </Upload>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <Alert
              message="KYC Compliance Note"
              description="Documents submitted are encrypted and strictly accessed by authorized Smart Line underwriting officers for risk evaluation."
              type="info"
              showIcon
              className="bg-blue-50/50 dark:bg-slate-900/90 border-blue-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            />

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} size="large" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button type="primary" size="large" onClick={handleNext} className="flex items-center gap-2">
                Review Application Summary <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRMATION */}
        {currentStep === 4 && !submittedApp && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Review & Declaration</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Facility Type</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {facilityType === 'LOAN' ? 'Money Loan' : 'Vehicle Leasing'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Requested Financing</span>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">
                    LKR {Number(amount).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Repayment Term</span>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {tenure} Months ({interestRate}% p.a.)
                  </p>
                </div>
              </div>

              <Divider className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Guarantors Count:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{guarantors.length} Provided</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Attached Documents:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{Object.keys(uploadedFiles).length} Files Staged</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                By clicking Submit Application, I declare that the details provided are true and accurate. I authorize
                Smart Line Investment to verify my employment, credit records via CRIB, and inspect the collateral if
                applicable.
              </div>

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button onClick={handleBack} size="large" disabled={submitting}>
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    size="large"
                    loading={submitting}
                    onClick={() => handleSubmitApplication(false)}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    loading={submitting}
                    onClick={() => handleSubmitApplication(true)}
                    className="bg-blue-600 hover:bg-blue-500 font-semibold"
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 4: SUCCESS RESULT */}
        {submittedApp && (
          <Card className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 rounded-2xl text-center py-8 shadow-sm">
            <Result
              status="success"
              title={<span className="text-slate-900 dark:text-white text-2xl font-bold">Application Successfully Lodged!</span>}
              subTitle={
                <div className="space-y-2 mt-2">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Your application has been received and allocated reference tracking number:
                  </p>
                  <Tag color="blue" className="text-base px-4 py-1.5 font-mono font-bold tracking-widest">
                    {submittedApp.applicationNumber}
                  </Tag>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
                    Status: <Tag color="orange">{submittedApp.status}</Tag> — Our Loan Officer will review your submission shortly.
                  </p>
                </div>
              }
              extra={[
                <Button
                  type="primary"
                  key="details"
                  size="large"
                  onClick={() => navigate(`/applications/${submittedApp.id}`)}
                >
                  View Application Status
                </Button>,
                <Button key="list" size="large" onClick={() => navigate('/applications')}>
                  Go to My Applications
                </Button>,
              ]}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplyLoanPage;
