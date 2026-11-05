import { API_BASE_URL } from '../apiConfig';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Card, Row, Col, Statistic, Button, Table, Modal, Form, Input,
    InputNumber, Typography, Space, message, Select, Tag
} from 'antd';
import { DatePicker } from 'antd';
import {
    SendOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined,
    ShoppingOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MSMEAnalyticsGraph from '../components/MSMEAnalyticsGraph';

const { Title, Text } = Typography;
const API = API_BASE_URL;
export default function MSMEDashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // ── Shipment State ──
    const [shipments, setShipments] = useState([]);

    // ── Fetch Functions ──
    const fetchShipments = useCallback(async () => {
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`${API}/shipments`, { headers });
            setShipments(res.data);
        } catch { message.error('Failed to load shipments'); }
    }, [token]);

    useEffect(() => {
        const timer = setTimeout(fetchShipments, 0);
        return () => clearTimeout(timer);
    }, [fetchShipments]);

    // ── Shipment Stats ──
    const stats = {
        total: shipments.length,
        pending: shipments.filter(s => s.status === 'PENDING').length,
        active: shipments.filter(s => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(s.status)).length,
        delivered: shipments.filter(s => ['DELIVERED', 'CONFIRMED'].includes(s.status)).length,
    };


    // ── Columns ──
    const _shipmentColumns = [
        {
            title: 'Tracking #', dataIndex: 'tracking_number', key: 'tracking_number',
            render: (t, r) => <a onClick={() => navigate(`/msme/shipments/${r.id}`)}>{t}</a>
        },
        {
            title: 'Item', dataIndex: 'items', key: 'items',
            render: (items) => (
                <Space direction="vertical" size={0}>
                    {items?.length > 0 ? items.map(i => (
                        <Text key={i.id} style={{ fontSize: 13 }}>{i.name}</Text>
                    )) : <Text type="secondary">-</Text>}
                </Space>
            )
        },
        {
            title: 'Type', key: 'order_type', width: 100,
            render: (_, r) => {
                if (r.description && r.description.includes('Order Type: Collection')) {
                    return <Tag color="orange">Collection</Tag>;
                }
                if (r.description && r.description.includes('Order Type: Delivery')) {
                    return <Tag color="blue">Delivery</Tag>;
                }
                return null;
            }
        },
        { 
            title: 'Pickup', 
            key: 'pickup', 
            render: (_, r) => r.pickup_lat && r.pickup_lng ? `${r.pickup_lat.toFixed(4)}, ${r.pickup_lng.toFixed(4)}` : r.pickup_address,
            ellipsis: true 
        },
        { 
            title: 'Drop', 
            key: 'drop', 
            render: (_, r) => r.drop_lat && r.drop_lng ? `${r.drop_lat.toFixed(4)}, ${r.drop_lng.toFixed(4)}` : r.drop_address,
            ellipsis: true 
        },
        { title: 'Weight', dataIndex: 'total_weight', key: 'weight', render: v => `${v} kg`, width: 90 },
        {
            title: 'Status', dataIndex: 'status', key: 'status', width: 120,
            render: s => <span style={{ fontWeight: 500 }}>{s.replace(/_/g, ' ')}</span>
        },
        {
            title: 'Created', dataIndex: 'created_at', key: 'created_at', width: 110,
            render: d => new Date(d).toLocaleDateString()
        },
        {
            title: '', key: 'actions', width: 50,
            render: (_, r) => (
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/msme/shipments/${r.id}`)} />
            )
        },
    ];


    return (
        <div>
            {/* ─── Header ─── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>User Dashboard</Title>
            </div>

            {/* ─── Stats ─── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card bordered={false}><Statistic title="Total Shipments" value={stats.total} prefix={<ShoppingOutlined />} /></Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}><Statistic title="Pending" value={stats.pending} prefix={<ClockCircleOutlined />} /></Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}><Statistic title="Active" value={stats.active} prefix={<SendOutlined />} /></Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}><Statistic title="Delivered" value={stats.delivered} prefix={<CheckCircleOutlined />} /></Card>
                </Col>
            </Row>

            {/* ─── Analytics ─── */}
            <MSMEAnalyticsGraph data={shipments} />

        </div>
    );
}
