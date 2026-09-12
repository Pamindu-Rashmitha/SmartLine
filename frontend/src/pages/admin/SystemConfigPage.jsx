import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Modal, Form, message, Row, Col, Tag, Tooltip } from 'antd';
import {
  Settings,
  Scale,
  Percent,
  Calendar,
  Building2,
  Phone,
  Mail,
  Edit3,
  RefreshCw,
  Clock,
  ShieldAlert,
  Info,
} from 'lucide-react';
import dayjs from 'dayjs';
import adminApi from '../../api/adminApi';

const CONFIG_METADATA = {
  SENIOR_APPROVAL_THRESHOLD: {
    title: 'Senior Sanction Threshold',
    category: 'RISK_POLICY',
    unit: 'LKR',
    icon: Scale,
    color: 'indigo',
    helper: 'Facility exposures exceeding this value are automatically escalated to Senior Managers.',
    format: (v) => `LKR ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  },
  OVERDUE_GRACE_PERIOD_DAYS: {
    title: 'Delinquency Grace Period',
    category: 'RISK_POLICY',
    unit: 'Days',
    icon: Clock,
    color: 'amber',
    helper: 'Grace period after installment due date before transitioning balance to OVERDUE.',
    format: (v) => `${v} Day(s)`,
  },
  DEFAULT_LOAN_INTEREST_RATE: {
    title: 'Standard Money Loan Rate',
    category: 'RATES_TENURE',
    unit: '% p.a.',
    icon: Percent,
    color: 'emerald',
    helper: 'Default annual straight-line flat interest rate for personal and commercial money loans.',
    format: (v) => `${v}% per annum`,
  },
  DEFAULT_LEASE_INTEREST_RATE: {
    title: 'Standard Vehicle Lease Rate',
    category: 'RATES_TENURE',
    unit: '% p.a.',
    icon: Percent,
    color: 'emerald',
    helper: 'Default annual straight-line flat interest rate for vehicle leasing and asset finance.',
    format: (v) => `${v}% per annum`,
  },
  MAX_LOAN_TENURE_MONTHS: {
    title: 'Max Money Loan Tenure',
    category: 'RATES_TENURE',
    unit: 'Months',
    icon: Calendar,
    color: 'blue',
    helper: 'Maximum allowed repayment amortization duration for money loans.',
    format: (v) => `${v} Months`,
  },
  MAX_LEASE_TENURE_MONTHS: {
    title: 'Max Vehicle Lease Tenure',
    category: 'RATES_TENURE',
    unit: 'Months',
    icon: Calendar,
    color: 'blue',
    helper: 'Maximum allowed repayment amortization duration for vehicle leases.',
    format: (v) => `${v} Months`,
  },
  COMPANY_NAME: {
    title: 'Corporate Legal Name',
    category: 'IDENTITY',
    unit: 'Text',
    icon: Building2,
    color: 'purple',
    helper: 'Entity name printed on official legal agreements, prom notes, and payment receipts.',
    format: (v) => v,
  },
  HOTLINE_PHONE: {
    title: 'Customer Recovery Hotline',
    category: 'IDENTITY',
    unit: 'Contact',
    icon: Phone,
    color: 'cyan',
    helper: 'Primary contact number displayed to borrowers on payment notices and arrears reminders.',
    format: (v) => v,
  },
  SUPPORT_EMAIL: {
    title: 'Official Support Email',
    category: 'IDENTITY',
    unit: 'Email',
    icon: Mail,
    color: 'cyan',
    helper: 'Designated email address for verification inquiries and customer service tickets.',
    format: (v) => v,
  },
};

const CATEGORIES = [
  {
    key: 'RISK_POLICY',
    title: 'Credit Risk & Authorization Policies',
    description: 'Threshold limits and delinquency criteria governing underwriting workflows.',
  },
  {
    key: 'RATES_TENURE',
    title: 'Financial Rates & Repayment Tenures',
    description: 'Core lending parameters used in Straight-Line EMI generation and lease calculations.',
  },
  {
    key: 'IDENTITY',
    title: 'Corporate Identity & Communication',
    description: 'Entity identifiers and contact details embedded in contracts and customer communications.',
  },
];

const SystemConfigPage = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemConfigs();
      if (res.data) {
        setConfigs(res.data);
      }
    } catch (err) {
      console.error('Failed to load system configs:', err);
      message.error('Failed to load system configuration parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const openEditModal = (config) => {
    setSelectedConfig(config);
    form.setFieldsValue({
      configValue: config.configValue,
      description: config.description,
    });
    setEditModalOpen(true);
  };

  const handleSaveConfig = async (values) => {
    setSaving(true);
    try {
      await adminApi.updateSystemConfig(selectedConfig.configKey, values);
      message.success(`Updated parameter "${selectedConfig.configKey}"`);
      setEditModalOpen(false);
      fetchConfigs();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update configuration parameter');
    } finally {
      setSaving(false);
    }
  };

  const configsByKey = configs.reduce((acc, c) => {
    acc[c.configKey] = c;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-sm transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
              System Configuration & Business Rules
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-0">
            Dynamically adjust risk sanction thresholds, interest rates, repayment tenure caps, and organizational parameters without redeploying.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchConfigs}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 text-xs font-medium"
          >
            Reload Parameters
          </Button>
        </div>
      </div>

      {/* Categorized Configuration Sections */}
      {CATEGORIES.map((category) => {
        const categoryConfigs = Object.keys(CONFIG_METADATA)
          .filter((k) => CONFIG_METADATA[k].category === category.key)
          .map((k) => ({
            key: k,
            meta: CONFIG_METADATA[k],
            data: configsByKey[k] || { configKey: k, configValue: '—', description: CONFIG_METADATA[k].helper },
          }));

        return (
          <div key={category.key} className="space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-200 m-0">{category.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">{category.description}</p>
            </div>

            <Row gutter={[16, 16]}>
              {categoryConfigs.map(({ key, meta, data }) => {
                const IconComponent = meta.icon;
                const formattedValue = meta.format ? meta.format(data.configValue) : data.configValue;

                return (
                  <Col xs={24} sm={12} lg={8} key={key}>
                    <Card
                      className="bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md relative group h-full flex flex-col justify-between"
                      bodyStyle={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700/50">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {meta.title}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{data.configKey}</span>
                            </div>
                          </div>

                          <Button
                            size="small"
                            icon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => openEditModal(data)}
                            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-xs flex items-center"
                          >
                            Edit
                          </Button>
                        </div>

                        <div className="mt-3">
                          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                            {formattedValue}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed min-h-[36px]">
                            {data.description || meta.helper}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>Updated: {data.updatedAt ? dayjs(data.updatedAt).format('DD MMM YYYY, HH:mm') : 'Seeded Default'}</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">by {data.updatedByUsername || 'SYSTEM'}</span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        );
      })}

      {/* Modal: Edit Config Parameter */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Modify System Parameter: {selectedConfig?.configKey}</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSaveConfig} className="mt-4">
          <div className="p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Changes take effect immediately across all underwriting, loan evaluation, and agreement execution services without server restarts.
            </span>
          </div>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Parameter Value</span>}
            name="configValue"
            rules={[{ required: true, message: 'Please enter parameter value' }]}
          >
            <Input className="font-mono text-sm" />
          </Form.Item>

          <Form.Item
            label={<span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Operational Description & Policy Note</span>}
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Describe the business rationale for this configuration setting..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} className="bg-blue-600 hover:bg-blue-500 font-semibold">
              Update Parameter
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
