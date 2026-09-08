import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Tag,
  DatePicker,
  Radio,
  Row,
  Col,
  Space,
  Divider,
  Alert,
  message,
} from 'antd';
import {
  Car,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  DollarSign,
  ClipboardList,
  Building,
  Phone,
  ShieldCheck,
  Save,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import inspectionApi from '../../api/inspectionApi';
import StatusBadge from '../../components/common/StatusBadge';
import dayjs from 'dayjs';

const { TextArea } = Input;

const VehicleInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);

  // Form states
  const [inspectionDate, setInspectionDate] = useState(dayjs());
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [mechanicalCondition, setMechanicalCondition] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [forcedSaleValue, setForcedSaleValue] = useState('');
  const [recommendedValue, setRecommendedValue] = useState('');
  const [overallRating, setOverallRating] = useState('GOOD');
  const [remarks, setRemarks] = useState('');

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.getApplicationDetail(id);
      if (res.data) {
        setApplication(res.data);
        const vld = res.data.vehicleLeaseDetail;
        if (vld && vld.estimatedMarketValue && !marketValue) {
          setMarketValue(vld.estimatedMarketValue.toString());
          const est = Number(vld.estimatedMarketValue);
          setForcedSaleValue((est * 0.8).toFixed(2));
          setRecommendedValue((est * 0.75).toFixed(2));
        }

        if (res.data.vehicleInspection) {
          const vi = res.data.vehicleInspection;
          setInspectionDate(dayjs(vi.inspectionDate));
          setPhysicalCondition(vi.physicalCondition || '');
          setMechanicalCondition(vi.mechanicalCondition || '');
          setMarketValue(vi.estimatedMarketValue?.toString() || '');
          setForcedSaleValue(vi.forcedSaleValue?.toString() || '');
          setRecommendedValue(vi.recommendedValue?.toString() || '');
          setOverallRating(vi.overallRating || 'GOOD');
          setRemarks(vi.remarks || '');
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

  const handleMarketValueChange = (val) => {
    setMarketValue(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setForcedSaleValue((num * 0.8).toFixed(2));
      setRecommendedValue((num * 0.75).toFixed(2));
    }
  };

  const handleSubmitReport = async () => {
    if (!marketValue || Number(marketValue) <= 0) {
      message.error('Please enter a valid estimated market value');
      return;
    }

    if (!remarks.trim()) {
      message.error('Please enter inspection remarks');
      return;
    }

    setSubmitting(true);
    try {
      await inspectionApi.recordInspection(id, {
        inspectionDate: inspectionDate.format('YYYY-MM-DD'),
        physicalCondition,
        mechanicalCondition,
        estimatedMarketValue: Number(marketValue),
        forcedSaleValue: forcedSaleValue ? Number(forcedSaleValue) : null,
        recommendedValue: recommendedValue ? Number(recommendedValue) : null,
        overallRating,
        remarks,
      });

      message.success('Vehicle inspection report submitted successfully!');
      navigate('/field-visits');
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to submit inspection report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading vehicle inspection appraisal...</p>
      </div>
    );
  }

  const vld = application.vehicleLeaseDetail;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/field-visits')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 flex items-center justify-center h-10 w-10 p-0 rounded-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0 font-mono">
                {application.applicationNumber}
              </h1>
              <Tag color="purple" className="font-semibold text-xs">
                Vehicle Lease
              </Tag>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Borrower: <span className="text-slate-200 font-semibold">{application.applicantName}</span> | Contact: {application.applicantPhone}
            </p>
          </div>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Left Column: Declared Vehicle & Dealer Details */}
        <Col xs={24} lg={9}>
          <div className="space-y-5">
            {/* Declared Asset Specifications */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                Declared Vehicle Specs
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Make & Model:</span>
                  <span className="text-slate-200 font-bold">
                    {vld?.make} {vld?.model}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200 font-semibold">{vld?.vehicleCategory}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Year of Manufacture:</span>
                  <span className="text-slate-200 font-semibold">{vld?.yearOfManufacture}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Registration Number:</span>
                  <span className="text-blue-400 font-mono font-bold">
                    {vld?.registrationNumber || 'UNREGISTERED'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Engine Number:</span>
                  <span className="text-slate-300 font-mono">{vld?.engineNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Chassis Number:</span>
                  <span className="text-slate-300 font-mono">{vld?.chassisNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Condition:</span>
                  <span className="text-slate-200">{vld?.vehicleCondition}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Declared Value:</span>
                  <span className="text-emerald-400 font-bold">
                    LKR {Number(vld?.estimatedMarketValue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Customer Down-payment:</span>
                  <span className="text-white font-bold">
                    LKR {Number(vld?.downPaymentAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Showroom / Dealer Location */}
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-lg">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                Dealer & Location
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer Name:</span>
                  <span className="text-slate-200 font-semibold">{vld?.dealerName || 'Direct Vendor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer Contact:</span>
                  <span className="text-slate-200">{vld?.dealerContact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant Address:</span>
                  <span className="text-slate-200 max-w-[170px] text-right">{application.applicantAddress}</span>
                </div>
              </div>
            </Card>
          </div>
        </Col>

        {/* Right Column: Digital Inspection Form */}
        <Col xs={24} lg={15}>
          <Card className="bg-slate-900/90 border-slate-800 rounded-2xl shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              Digital Field Inspection & Valuation Report (US07)
            </h3>

            <div className="space-y-5">
              {/* Inspection Date */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Inspection Date *
                </label>
                <DatePicker
                  value={inspectionDate}
                  onChange={(d) => setInspectionDate(d || dayjs())}
                  className="w-full sm:w-60 bg-slate-950 border-slate-700 text-slate-200 text-xs rounded-lg"
                />
              </div>

              {/* Physical Condition */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Physical Body & Exterior Condition Assessment
                </label>
                <TextArea
                  rows={3}
                  placeholder="Evaluate paint condition, body panels, rust, signs of previous accident repair, tire tread depth, lighting, windscreen..."
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-slate-200 text-xs rounded-lg"
                />
              </div>

              {/* Mechanical Condition */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mechanical, Engine & Operational Condition Assessment
                </label>
                <TextArea
                  rows={3}
                  placeholder="Engine startup, idle compression, gearbox shift quality, brake operation, suspension squeaks, battery health, electrical harness..."
                  value={mechanicalCondition}
                  onChange={(e) => setMechanicalCondition(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-slate-200 text-xs rounded-lg"
                />
              </div>

              {/* Valuations Grid */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Asset Valuation Assessment (LKR)
                </h4>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Estimated Market Value *
                    </label>
                    <Input
                      prefix="LKR"
                      placeholder="e.g. 1500000"
                      value={marketValue}
                      onChange={(e) => handleMarketValueChange(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white font-bold text-xs rounded-lg"
                    />
                  </Col>

                  <Col xs={24} sm={8}>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Forced Sale Value (~80%)
                    </label>
                    <Input
                      prefix="LKR"
                      placeholder="e.g. 1200000"
                      value={forcedSaleValue}
                      onChange={(e) => setForcedSaleValue(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-amber-400 font-bold text-xs rounded-lg"
                    />
                  </Col>

                  <Col xs={24} sm={8}>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Recommended Loan Limit (~75%)
                    </label>
                    <Input
                      prefix="LKR"
                      placeholder="e.g. 1125000"
                      value={recommendedValue}
                      onChange={(e) => setRecommendedValue(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-emerald-400 font-bold text-xs rounded-lg"
                    />
                  </Col>
                </Row>
              </div>

              {/* Overall Condition Rating */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Overall Vehicle Condition Rating *
                </label>
                <Radio.Group
                  value={overallRating}
                  onChange={(e) => setOverallRating(e.target.value)}
                  className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  <Radio.Button
                    value="EXCELLENT"
                    className={`text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                      overallRating === 'EXCELLENT' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Excellent
                  </Radio.Button>
                  <Radio.Button
                    value="GOOD"
                    className={`text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                      overallRating === 'GOOD' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Good
                  </Radio.Button>
                  <Radio.Button
                    value="FAIR"
                    className={`text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                      overallRating === 'FAIR' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Fair
                  </Radio.Button>
                  <Radio.Button
                    value="POOR"
                    className={`text-center font-bold text-xs h-9 leading-9 rounded-lg ${
                      overallRating === 'POOR' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Poor
                  </Radio.Button>
                </Radio.Group>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Field Officer Valuation Remarks & Recommendations *
                </label>
                <TextArea
                  rows={4}
                  placeholder="Summarize asset viability for leasing, recommend exposure ceiling, note any mechanical defects or restoration requirements..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-slate-200 text-xs rounded-lg"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  onClick={() => navigate('/field-visits')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 font-semibold text-xs h-10 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmitReport}
                  loading={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs h-10 px-6 border-0 flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Inspection Report (→ Credit Manager)
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VehicleInspectionPage;
