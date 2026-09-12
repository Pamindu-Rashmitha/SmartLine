import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Upload,
  message,
  Row,
  Col,
  Empty,
  Spin,
  Alert,
  Tooltip,
  Radio,
} from 'antd';
import {
  FolderLock,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldCheck,
  Calendar,
  Layers,
  LayoutGrid,
  List as ListIcon,
  Plus,
  FileSpreadsheet,
  FileImage,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import documentApi from '../../api/documentApi';
import applicationApi from '../../api/applicationApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Dragger } = Upload;

const DOCUMENT_TYPE_LABELS = {
  NIC_FRONT: 'National ID (Front)',
  NIC_BACK: 'National ID (Back)',
  SALARY_SLIP: 'Salary Slip / Income Proof',
  BANK_STATEMENT: 'Bank Account Statement',
  UTILITY_BILL: 'Billing / Address Proof',
  VEHICLE_REGISTRATION: 'Vehicle Registration / CR',
  VEHICLE_INVOICE: 'Dealer Proforma Invoice',
  VEHICLE_REVENUE_LICENSE: 'Vehicle Revenue License',
  INSURANCE_CARD: 'Insurance Certificate',
  GUARANTOR_NIC_FRONT: 'Guarantor NIC (Front)',
  GUARANTOR_NIC_BACK: 'Guarantor NIC (Back)',
  GUARANTOR_SALARY_SLIP: 'Guarantor Income Proof',
  OTHER: 'Supporting Document',
};

const DocumentVaultPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('SALARY_SLIP');
  const [fileList, setFileList] = useState([]);

  // Fetch documents and user's applications
  const fetchVaultData = async () => {
    setLoading(true);
    try {
      const [docsRes, appsRes] = await Promise.all([
        documentApi.getMyDocuments().catch((err) => {
          console.error('Failed to load my documents:', err);
          return { data: [] };
        }),
        applicationApi.getMyApplications().catch((err) => {
          console.error('Failed to load my applications:', err);
          return { data: [] };
        }),
      ]);

      const docList = docsRes?.data || [];
      setDocuments(docList);

      const appList = appsRes?.data || [];
      setApplications(appList);
      if (appList.length > 0 && !selectedAppId) {
        setSelectedAppId(appList[0].id);
      }
    } catch (err) {
      console.error('Vault load error:', err);
      message.error('Failed to synchronize document vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Get file icon based on content type or filename
  const getFileIcon = (contentType, filename) => {
    const fn = (filename || '').toLowerCase();
    const ct = (contentType || '').toLowerCase();
    if (ct.includes('pdf') || fn.endsWith('.pdf')) {
      return <FileText className="w-7 h-7 text-red-500" />;
    }
    if (ct.includes('image') || fn.match(/\.(jpg|jpeg|png|webp)$/)) {
      return <FileImage className="w-7 h-7 text-blue-500" />;
    }
    if (fn.match(/\.(xls|xlsx|csv)$/)) {
      return <FileSpreadsheet className="w-7 h-7 text-emerald-500" />;
    }
    return <FileText className="w-7 h-7 text-indigo-500" />;
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Tag color="success" className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </Tag>
        );
      case 'REJECTED':
        return (
          <Tag color="error" className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </Tag>
        );
      default:
        return (
          <Tag color="warning" className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Pending Verification
          </Tag>
        );
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (doc.originalFilename && doc.originalFilename.toLowerCase().includes(q)) ||
      (doc.documentType && doc.documentType.toLowerCase().includes(q)) ||
      (doc.applicationNumber && doc.applicationNumber.toLowerCase().includes(q));

    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.verificationStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI Metrics
  const totalCount = documents.length;
  const verifiedCount = documents.filter((d) => d.verificationStatus === 'VERIFIED').length;
  const pendingCount = documents.filter((d) => d.verificationStatus === 'PENDING').length;
  const rejectedCount = documents.filter((d) => d.verificationStatus === 'REJECTED').length;

  // Handle Download
  const handleDownload = async (doc) => {
    try {
      message.loading({ content: 'Downloading document...', key: 'dl' });
      await documentApi.downloadDocument(doc.id, doc.originalFilename);
      message.success({ content: 'Download started', key: 'dl' });
    } catch (err) {
      console.error('Download error:', err);
      message.error({ content: 'Failed to download file', key: 'dl' });
    }
  };

  // Handle Upload
  const handleUploadSubmit = async () => {
    if (!selectedAppId) {
      message.error('Please select an application to attach the document to');
      return;
    }
    if (!fileList || fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const fileToUpload = fileList[0].originFileObj || fileList[0];
    setUploading(true);
    try {
      await documentApi.uploadDocument(selectedAppId, selectedDocType, fileToUpload);
      message.success('Document uploaded successfully to your vault');
      setIsUploadModalOpen(false);
      setFileList([]);
      fetchVaultData();
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Table Columns
  const tableColumns = [
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type, record) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
            {getFileIcon(record.contentType, record.originalFilename)}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white text-xs block">
              {DOCUMENT_TYPE_LABELS[type] || type}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {record.originalFilename}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Application Reference',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (ref, record) => (
        <div>
          {ref ? (
            <Button
              type="link"
              onClick={() => navigate(`/applications/${record.applicationId}`)}
              className="p-0 font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1"
            >
              {ref} <ExternalLink className="w-3 h-3" />
            </Button>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
          {record.applicationType && (
            <span className="text-[11px] text-slate-500 block">
              {record.applicationType === 'VEHICLE_LEASE' ? 'Vehicle Lease' : 'Money Loan'}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{formatFileSize(size)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      width: 160,
      render: (status, record) => (
        <div>
          {renderStatusBadge(status)}
          {record.rejectionReason && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 mb-0 leading-tight">
              {record.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 150,
      render: (date) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '—'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => handleDownload(record)}
          className="text-xs font-medium rounded-lg flex items-center gap-1 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900 border border-blue-500/30 dark:border-slate-800 p-6 sm:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 text-xs font-semibold">
                <FolderLock className="w-3.5 h-3.5" />
                <span>CENTRALIZED DOCUMENT VAULT</span>
              </div>
              <Tag color="cyan" className="rounded-full px-2.5 py-0.5 border-0 bg-blue-500/30 text-white font-medium text-xs">
                Encrypted Storage
              </Tag>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
              Applicant Document Vault
            </h1>
            <p className="text-sm text-blue-100 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Secure digital repository for your KYC documents, identity verification, income proofs, and vehicle registration deeds. Accessible anytime for reference and audit.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchVaultData}
              className="bg-white/15 hover:bg-white/25 text-white border-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 h-10 px-4 rounded-xl"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<UploadCloud className="w-4 h-4 text-blue-700" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white hover:bg-blue-50 text-blue-700 font-semibold border-0 shadow-lg h-10 px-4 rounded-xl flex items-center gap-1.5"
            >
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Files
              </span>
              <div className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {totalCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Verified
              </span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {verifiedCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Under Verification
              </span>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {pendingCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Action Required
              </span>
              <div className="mt-1 text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                {rejectedCount}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & View Switcher Bar */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Input
              placeholder="Search filename or application #..."
              prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="w-full sm:w-64 rounded-xl"
            />

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-52"
            >
              <Option value="ALL">All Document Types</Option>
              <Option value="NIC_FRONT">National ID (Front)</Option>
              <Option value="NIC_BACK">National ID (Back)</Option>
              <Option value="SALARY_SLIP">Salary Slip</Option>
              <Option value="BANK_STATEMENT">Bank Statement</Option>
              <Option value="UTILITY_BILL">Utility / Billing Proof</Option>
              <Option value="VEHICLE_REGISTRATION">Vehicle Book (CR)</Option>
            </Select>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-44"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="VERIFIED">Verified</Option>
              <Option value="PENDING">Pending Review</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="grid">
                <LayoutGrid className="w-4 h-4 inline-block mr-1" /> Grid
              </Radio.Button>
              <Radio.Button value="table">
                <ListIcon className="w-4 h-4 inline-block mr-1" /> Table
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </Card>

      {/* Content View: Grid or Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Spin size="large" />
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
            Loading document vault...
          </span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Empty
            description={
              <div className="space-y-2 mt-2">
                <p className="text-slate-600 dark:text-slate-300 font-medium text-sm m-0">
                  {documents.length === 0
                    ? 'Your Document Vault is empty'
                    : 'No documents match your current filter criteria'}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto m-0">
                  {documents.length === 0
                    ? 'Uploaded documents from your loan applications will automatically be indexed here for quick access and downloads.'
                    : 'Try changing your search keywords or clearing your filters.'}
                </p>
              </div>
            }
          >
            {documents.length === 0 && applications.length > 0 && (
              <Button
                type="primary"
                icon={<UploadCloud className="w-4 h-4" />}
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-3 bg-blue-600 hover:bg-blue-700"
              >
                Upload First Document
              </Button>
            )}
          </Empty>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              bodyStyle={{ padding: '20px' }}
            >
              <div>
                {/* Header: Type and Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
                      {getFileIcon(doc.contentType, doc.originalFilename)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white m-0 line-clamp-1">
                        {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                      </h4>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 line-clamp-1" title={doc.originalFilename}>
                        {doc.originalFilename}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  {renderStatusBadge(doc.verificationStatus)}
                  <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatFileSize(doc.fileSize)}
                  </span>
                </div>

                {/* Rejection Warning if applicable */}
                {doc.verificationStatus === 'REJECTED' && doc.rejectionReason && (
                  <Alert
                    type="error"
                    showIcon
                    message="Verification Issue"
                    description={doc.rejectionReason}
                    className="mb-4 text-xs bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60"
                  />
                )}

                {/* Metadata List */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 py-3 border-t border-slate-100 dark:border-slate-800">
                  {doc.applicationNumber && (
                    <div className="flex items-center justify-between">
                      <span>Application:</span>
                      <Button
                        type="link"
                        onClick={() => navigate(`/applications/${doc.applicationId}`)}
                        className="p-0 font-mono font-semibold text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1"
                      >
                        {doc.applicationNumber} <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Uploaded Date:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {doc.uploadedAt ? dayjs(doc.uploadedAt).format('YYYY-MM-DD') : '—'}
                    </span>
                  </div>
                  {doc.verifiedByName && (
                    <div className="flex items-center justify-between">
                      <span>Reviewed By:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {doc.verifiedByName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center gap-2">
                <Button
                  type="primary"
                  ghost
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => handleDownload(doc)}
                  className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <Table
            dataSource={filteredDocuments}
            columns={tableColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            className="dark-table-fix"
          />
        </Card>
      )}

      {/* Upload Document Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Upload Document to Vault</span>
          </div>
        }
        open={isUploadModalOpen}
        onCancel={() => {
          setIsUploadModalOpen(false);
          setFileList([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsUploadModalOpen(false);
              setFileList([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleUploadSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upload File
          </Button>,
        ]}
        className="rounded-2xl"
      >
        <div className="space-y-4 py-2">
          {applications.length === 0 ? (
            <Alert
              type="info"
              showIcon
              message="No Active Applications"
              description="Documents must be associated with an application. Please submit a loan application first."
            />
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Application
                </label>
                <Select
                  value={selectedAppId}
                  onChange={setSelectedAppId}
                  className="w-full"
                  placeholder="Select application reference"
                >
                  {applications.map((app) => (
                    <Option key={app.id} value={app.id}>
                      {app.applicationNumber} — {app.type === 'VEHICLE_LEASE' ? 'Vehicle Lease' : 'Money Loan'} ({app.status})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Type
                </label>
                <Select
                  value={selectedDocType}
                  onChange={setSelectedDocType}
                  className="w-full"
                >
                  <Option value="NIC_FRONT">National ID (Front)</Option>
                  <Option value="NIC_BACK">National ID (Back)</Option>
                  <Option value="SALARY_SLIP">Recent Salary Slip (Income Proof)</Option>
                  <Option value="BANK_STATEMENT">Bank Statement (Past 6 Months)</Option>
                  <Option value="UTILITY_BILL">Utility / Billing Proof</Option>
                  <Option value="VEHICLE_REGISTRATION">Vehicle Registration / CR</Option>
                  <Option value="VEHICLE_INVOICE">Vehicle Proforma Invoice</Option>
                  <Option value="OTHER">Other Supporting Document</Option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select File (PDF, JPG, PNG up to 10MB)
                </label>
                <Dragger
                  name="file"
                  multiple={false}
                  fileList={fileList}
                  beforeUpload={(file) => {
                    const isLt10M = file.size / 1024 / 1024 < 10;
                    if (!isLt10M) {
                      message.error('File must be smaller than 10MB!');
                      return Upload.LIST_IGNORE;
                    }
                    setFileList([file]);
                    return false;
                  }}
                  onRemove={() => setFileList([])}
                  className="bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700"
                >
                  <p className="ant-upload-drag-icon flex justify-center text-blue-600 dark:text-blue-400 mb-2">
                    <UploadCloud className="w-10 h-10" />
                  </p>
                  <p className="ant-upload-text text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint text-xs text-slate-500">
                    Supports high-resolution scans and PDF documents
                  </p>
                </Dragger>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentVaultPage;
