import React, { useMemo } from 'react';
import { Card, Slider, InputNumber, Row, Col } from 'antd';
import { Calculator, DollarSign, Calendar, TrendingUp, ShieldCheck } from 'lucide-react';

export const calculateFlatEmi = (principal, annualRate, tenureMonths) => {
  if (!principal || !annualRate || !tenureMonths || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayable: 0 };
  }
  const years = tenureMonths / 12;
  const totalInterest = principal * (annualRate / 100) * years;
  const totalPayable = principal + totalInterest;
  const emi = totalPayable / tenureMonths;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
  };
};

const LoanCalculatorWidget = ({
  amount = 500000,
  tenure = 24,
  rate = 14.5,
  onAmountChange,
  onTenureChange,
  minAmount = 50000,
  maxAmount = 5000000,
  minTenure = 6,
  maxTenure = 60,
  readOnly = false,
  title = 'Interactive Installment Calculator',
}) => {
  const calculations = useMemo(() => {
    return calculateFlatEmi(amount, rate, tenure);
  }, [amount, rate, tenure]);

  const formatLKR = (val) => {
    return `LKR ${Number(val || 0).toLocaleString('en-LK')}`;
  };

  return (
    <Card className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Fixed rate of {rate}% p.a. with transparent monthly repayments</p>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sliders & Inputs */}
        <Col xs={24} lg={14} className="space-y-6">
          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Requested Financing Amount
              </span>
              <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">{formatLKR(amount)}</span>
            </div>
            {!readOnly ? (
              <>
                <Slider
                  min={minAmount}
                  max={maxAmount}
                  step={25000}
                  value={amount}
                  onChange={onAmountChange}
                  trackStyle={{ backgroundColor: '#2563EB', height: 6 }}
                  handleStyle={{ borderColor: '#3B82F6', backgroundColor: '#ffffff', width: 18, height: 18 }}
                  railStyle={{ backgroundColor: '#CBD5E1', height: 6 }}
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatLKR(minAmount)}</span>
                  <span>{formatLKR(maxAmount)}</span>
                </div>
              </>
            ) : null}
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Repayment Tenure
              </span>
              <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{tenure} Months ({Number(tenure / 12).toFixed(1)} Yrs)</span>
            </div>
            {!readOnly ? (
              <>
                <Slider
                  min={minTenure}
                  max={maxTenure}
                  step={6}
                  value={tenure}
                  onChange={onTenureChange}
                  trackStyle={{ backgroundColor: '#10B981', height: 6 }}
                  handleStyle={{ borderColor: '#10B981', backgroundColor: '#ffffff', width: 18, height: 18 }}
                  railStyle={{ backgroundColor: '#CBD5E1', height: 6 }}
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{minTenure} Mo</span>
                  <span>{maxTenure} Mo</span>
                </div>
              </>
            ) : null}
          </div>
        </Col>

        {/* Calculated Results Summary Box */}
        <Col xs={24} lg={10}>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-white dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Estimated Monthly Installment (EMI)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {formatLKR(calculations.emi)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
              </div>
            </div>

            <div className="my-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Principal Financing:</span>
                <span className="font-mono font-medium">{formatLKR(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Total Interest Charge:</span>
                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">{formatLKR(calculations.totalInterest)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-700/40">
                <span>Total Repayable:</span>
                <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{formatLKR(calculations.totalPayable)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              <span>Zero hidden handling fees. Final terms subject to credit assessment.</span>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default LoanCalculatorWidget;
