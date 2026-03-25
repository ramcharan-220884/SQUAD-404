import React, { useState, useEffect } from 'react';
import { Tag, Button, Space, message, Popconfirm, Card, Typography, Modal, Form, Input, Tooltip, Badge } from 'antd';
import { 
    MailOutlined, 
    CheckCircleOutlined, 
    EditOutlined, 
    SyncOutlined, 
    GlobalOutlined, 
    RocketOutlined,
    EnvironmentOutlined,
    BulbOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { authFetch } from "../../services/api";

const { Title, Text } = Typography;

const SourceIcon = ({ source }) => {
    const s = source?.toLowerCase() || '';
    if (s.includes('combinator')) return <div className="w-8 h-8 bg-[#ff6600] text-white rounded-lg flex items-center justify-center font-black text-lg shadow-sm">Y</div>;
    if (s.includes('remoteok')) return <div className="w-8 h-8 bg-[#ff4742] text-white rounded-lg flex items-center justify-center font-black text-lg shadow-sm">R</div>;
    if (s.includes('we work') || s.includes('wwr')) return <div className="w-8 h-8 bg-[#4c4c4c] text-white rounded-lg flex items-center justify-center font-black text-lg shadow-sm">W</div>;
    return <GlobalOutlined className="text-xl text-blue-500" />;
};

const AdminScrapedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [form] = Form.useForm();

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await authFetch("/scraped-jobs");
            const data = await res.json();
            if (data.success) {
                setJobs(data.data || []);
            } else {
                throw new Error(data.message || "Failed to fetch");
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load scraped jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleRunScraper = async () => {
        try {
            message.loading({ content: "Initiating hybrid scraper...", key: "scrape" });
            const res = await authFetch("/scraped-jobs/run-scraper", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                message.success({ content: "Hybrid scraping job started!", key: "scrape" });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            message.error({ content: "Failed to trigger scraper.", key: "scrape" });
        }
    };

    const handleEdit = (record) => {
        setEditingJob(record);
        form.setFieldsValue(record);
        setIsEditModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            if (values.hr_email && !values.hr_email.includes('@')) {
                return message.error("Please enter a valid email address");
            }
            const res = await authFetch("/scraped-jobs/update", {
                method: "POST",
                body: JSON.stringify({ ...values, id: editingJob.id })
            });
            const data = await res.json();
            if (data.success) {
                message.success("Lead updated successfully!");
                setIsEditModalVisible(false);
                fetchJobs();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            message.error(error.message || "Update failed");
        }
    };

    const handleAction = async (actionType, id) => {
        setActionLoading(id);
        try {
            const res = await authFetch(`/scraped-jobs/${actionType}`, {
                method: "POST",
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                message.success(data.message || "Action completed!");
                fetchJobs();
            } else {
                throw new Error(data.error || data.message || `Action failed`);
            }
        } catch (error) {
            message.error(error.message || `Action failed`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8 bg-[#fdfdfd] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <RocketOutlined className="text-3xl text-blue-600 animate-pulse" />
                        <Title level={2} className="!mb-0 font-black tracking-tight text-[#0a2540]">Strategic Job Hunter</Title>
                    </div>
                    <Text className="text-gray-400 font-medium text-lg block">Automated discovery engine for World-Class opportunities.</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<SyncOutlined spin={loading} />} 
                    onClick={handleRunScraper} 
                    className="mt-6 md:mt-0 h-14 px-10 font-bold text-lg rounded-2xl shadow-blue-200 shadow-2xl hover:scale-105 active:scale-95 transition-all bg-blue-600 border-none"
                >
                    Launch Hybrid Scraper
                </Button>
            </div>

            {/* Stats Overview (Optional Polish) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <Text className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">Total Leads</Text>
                    <Title level={2} className="!mb-0 font-black">{jobs.length}</Title>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <Text className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Approved</Text>
                    <Title level={2} className="!mb-0 font-black">{jobs.filter(j => j.is_approved).length}</Title>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
                    <Text className="text-purple-600 font-bold uppercase tracking-widest text-[10px]">Notified</Text>
                    <Title level={2} className="!mb-0 font-black">{jobs.filter(j => j.is_notified).length}</Title>
                </Card>
            </div>

            {/* Jobs List Container */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <SyncOutlined spin className="text-4xl text-blue-400 mb-4" />
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Engine...</Text>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                                {job.is_approved && <div className="absolute left-0 top-0 w-1 h-full bg-green-500"></div>}
                                
                                {/* Info & Source */}
                                <div className="flex items-center gap-5 flex-1 min-w-[300px]">
                                    <SourceIcon source={job.source_name} />
                                    <div className="space-y-1">
                                        <h3 className="font-extrabold text-lg text-[#0a2540] leading-tight flex items-center gap-2">
                                            {job.job_title}
                                            {job.is_notified && <RocketOutlined className="text-blue-500 text-xs" />}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                                            <span className="text-gray-600 font-bold">{job.company_name}</span>
                                            <span>•</span>
                                            <span>{job.location || 'Remote'}</span>
                                            <span>•</span>
                                            <Tag className="m-0 border-none bg-gray-100 text-[9px] uppercase font-black tracking-tighter">{job.source_name || 'Web'}</Tag>
                                        </div>
                                    </div>
                                </div>

                                {/* HR Contact Detail */}
                                <div className="hidden lg:flex flex-col gap-1 w-48">
                                    <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Primary Contact</Text>
                                    <div className="flex items-center gap-2 truncate">
                                        <Text className={job.hr_email ? "text-gray-700 font-bold text-sm truncate" : "text-gray-400 italic text-sm"}>{job.hr_email || 'No Lead Email'}</Text>
                                        {job.email_type === 'guessed' && <Badge status="warning" />}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="w-32 flex justify-center">
                                    <Tag className="rounded-full px-4 border-none font-black text-[10px] uppercase tracking-tighter" color={job.is_notified ? 'blue' : job.is_approved ? 'green' : 'gold'}>
                                        {job.is_notified ? 'Notified' : job.is_approved ? 'Approved' : 'Scraped'}
                                    </Tag>
                                </div>

                                {/* Action Toolbar */}
                                <div className="flex items-center gap-3">
                                    <Tooltip title="View Original Post">
                                        {job.source_url && <Button icon={<GlobalOutlined />} href={job.source_url} target="_blank" type="text" className="text-gray-400 hover:text-blue-600" />}
                                    </Tooltip>
                                    
                                    <Button icon={<EditOutlined />} onClick={() => handleEdit(job)} type="text" className="text-gray-400 hover:text-orange-500">Edit</Button>

                                    <Space size="small">
                                        <Popconfirm title="Send outreach email?" onConfirm={() => handleAction('contact', job.id)} disabled={!job.hr_email}>
                                            <Button 
                                                className={`rounded-xl font-bold h-9 transition-all ${job.hr_email ? 'text-blue-600 border-blue-100 hover:bg-blue-50' : 'text-gray-300 border-gray-100'}`} 
                                                icon={<MailOutlined />} 
                                                loading={actionLoading === job.id} 
                                                disabled={!job.hr_email}
                                            >
                                                Contact
                                            </Button>
                                        </Popconfirm>

                                        <Popconfirm title="Approve & Onboard?" onConfirm={() => handleAction('approve-onboard', job.id)} disabled={job.is_approved}>
                                            <Button 
                                                className={`rounded-xl font-bold h-9 transition-all ${!job.is_approved ? 'bg-green-600 text-white border-none px-4 shadow-sm hover:scale-105' : 'bg-gray-100 text-gray-400 border-none'}`} 
                                                icon={<CheckCircleOutlined />} 
                                                loading={actionLoading === job.id} 
                                                disabled={job.is_approved}
                                            >
                                                {job.is_approved ? 'Onboarded' : 'Approve'}
                                            </Button>
                                        </Popconfirm>

                                        <Button 
                                            type="primary" 
                                            className={`rounded-xl font-bold h-9 transition-all ${!job.is_notified && job.is_approved ? 'bg-blue-600 border-none px-4 shadow-sm hover:scale-105' : 'bg-gray-100 text-gray-400 border-none px-4'}`} 
                                            onClick={() => handleAction('notify-students', job.id)} 
                                            disabled={job.is_notified || !job.is_approved} 
                                            loading={actionLoading === job.id}
                                        >
                                            {job.is_notified ? 'Notified' : 'Notify Campus'}
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal title={<Title level={4}>Refine Lead Intelligence</Title>} open={isEditModalVisible} onOk={handleUpdate} onCancel={() => setIsEditModalVisible(false)} okText="Finalize Update" className="rounded-3xl" okButtonProps={{ className: "bg-blue-600 rounded-xl h-10 font-bold" }} cancelButtonProps={{ className: "rounded-xl h-10" }}>
                <Form form={form} layout="vertical" className="pt-4">
                    <Form.Item name="company_name" label={<Text className="font-bold">Organization Name</Text>} rules={[{ required: true }]}><Input className="h-10 rounded-xl" /></Form.Item>
                    <Form.Item name="job_title" label={<Text className="font-bold">Position Title</Text>} rules={[{ required: true }]}><Input className="h-10 rounded-xl" /></Form.Item>
                    <Form.Item name="hr_email" label={<Text className="font-bold">Strategic Email</Text>} help="Used for verified outreach and credential delivery"><Input placeholder="recruiter@company.com" className="h-10 rounded-xl" /></Form.Item>
                    <Form.Item name="location" label={<Text className="font-bold">Primary Location</Text>}><Input className="h-10 rounded-xl" /></Form.Item>
                    <Form.Item name="description" label={<Text className="font-bold">Intelligence Notes</Text>}><Input.TextArea rows={3} className="rounded-xl" /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminScrapedJobs;
