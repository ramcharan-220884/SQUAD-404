import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Card, Typography } from 'antd';
import { MailOutlined, CheckCircleOutlined, EditOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const AdminScrapedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Using relative path assuming proxy is set up or direct API hits
    const API_BASE = 'http://localhost:5000'; // Make sure this matches your backend

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${API_BASE}/api/scraped-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(data.data || []);
        } catch (error) {
            console.error(error);
            message.error('Failed to load scraped jobs from the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleRunScraper = async () => {
        try {
            message.loading({ content: 'Initiating backend scraper...', key: 'scrape' });
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/api/scraped-jobs/run-scraper`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success({ content: 'Scraping job started successfully in the background!', key: 'scrape' });
        } catch (error) {
            message.error({ content: 'Failed to trigger scraper backend module.', key: 'scrape' });
        }
    };

    const handleAction = async (actionType, id) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/api/scraped-jobs/${actionType}`, { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            message.success(`Job successfully marked as ${actionType === 'contact' ? 'contacted' : 'converted'}!`);
            fetchJobs();
        } catch (error) {
            message.error(error.response?.data?.message || `Failed to ${actionType} job`);
        } finally {
            setActionLoading(null);
        }
    };

    const columns = [
        {
            title: 'Company',
            dataIndex: 'company_name',
            key: 'company_name',
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
        },
        {
            title: 'Job Title',
            dataIndex: 'job_title',
            key: 'job_title',
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-medium text-blue-600 truncate max-w-xs">{text}</span>
                    {record.source_url && (
                        <a href={record.source_url} target="_blank" rel="noreferrer" className="text-[11px] text-gray-400 hover:text-blue-500 mt-0.5 w-max">
                            View Source ↗
                        </a>
                    )}
                </div>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (text) => text ? <span className="text-gray-600">{text}</span> : <span className="text-gray-400 italic">N/A</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'contacted') color = 'blue';
                if (status === 'converted') color = 'green';
                
                return (
                    <Tag color={color} className="uppercase font-semibold tracking-wider text-[10px] leading-4 px-2">
                        {status || 'pending'}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Popconfirm
                        title="Send outreach email?"
                        onConfirm={() => handleAction('contact', record.id)}
                        disabled={record.status !== 'pending'}
                    >
                        <Button type="primary" ghost icon={<MailOutlined />} size="small" loading={actionLoading === record.id} disabled={record.status !== 'pending'}>Contact</Button>
                    </Popconfirm>

                    <Popconfirm
                        title="Mark as converted?"
                        onConfirm={() => handleAction('convert', record.id)}
                        disabled={record.status === 'converted'}
                    >
                        <Button className="bg-green-50 text-green-600 border-green-200" icon={<CheckCircleOutlined />} size="small" loading={actionLoading === record.id} disabled={record.status === 'converted'}>Convert</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <Title level={3} className="!mb-1">Automated Leads & Scraping</Title>
                    <Text className="text-gray-500 text-sm">Manage automated job leads, conduct recruiter outreach, and convert prospects.</Text>
                </div>
                <Button type="primary" icon={<SyncOutlined />} onClick={handleRunScraper} className="mt-4 sm:mt-0 flex items-center h-10 px-6 font-medium rounded-lg">Run Scraper Now</Button>
            </div>

            <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
                <Table columns={columns} dataSource={jobs} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
            </Card>
        </div>
    );
};

export default AdminScrapedJobs;
