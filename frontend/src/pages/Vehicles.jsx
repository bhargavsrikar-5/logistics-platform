import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Table, Card, Tag, Button, Modal, Form, Input, InputNumber, Select,
    Typography, Space, message, Tooltip, Row, Col, Progress, Switch
} from 'antd';
import {
    PlusOutlined, CarOutlined, EditOutlined, DeleteOutlined, EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import TruckCargoVisualizer from '../components/TruckCargoVisualizer';
import { API_BASE_URL } from '../apiConfig';

const { Title, Text } = Typography;
const API = API_BASE_URL;

const VEHICLE_STATUS_COLORS = { 
    AVAILABLE: 'success', 
    ON_TRIP: 'processing', 
    MAINTENANCE: 'warning', 
    INACTIVE: 'default' 
};

export default function Vehicles() {
    const { token } = useAuth();
    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({});
    const [cargoViewVehicle, setCargoViewVehicle] = useState(null);

    const fetchVehiclesAndDrivers = useCallback(async (currentFilters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            currentFilters.status?.forEach(status => params.append('status', status));
            if (currentFilters.overloaded) params.append('overloaded', 'true');
            const [vRes, uRes] = await Promise.all([
                axios.get(`${API}/vehicles?${params.toString()}`, { headers }),
                axios.get(`${API}/users`, { headers }),
            ]);
            setVehicles(vRes.data);
            setDrivers(uRes.data.filter(u => u.role === 'DRIVER'));
        } catch { 
            message.error('Failed to load vehicles'); 
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => {
        fetchVehiclesAndDrivers();
    }, [fetchVehiclesAndDrivers]);

    const handleSave = async (values) => {
        try {
            if (editingVehicle) {
                await axios.put(`${API}/vehicles/${editingVehicle.id}`, values, { headers });
                message.success('Vehicle updated');
            } else {
                await axios.post(`${API}/vehicles`, values, { headers });
                message.success('Vehicle created');
            }
            setIsModalOpen(false); 
            form.resetFields(); 
            setEditingVehicle(null);
            fetchVehiclesAndDrivers(filters);
        } catch (err) { 
            message.error(err.response?.data?.detail || 'Failed to save vehicle'); 
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete vehicle?',
            content: 'This action cannot be undone and may affect active shipments.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`${API}/vehicles/${id}`, { headers });
                    message.success('Vehicle deleted');
                    fetchVehiclesAndDrivers(filters);
                } catch {
                    message.error('Failed to delete vehicle');
                }
            }
        });
    };

    const columns = [
        { 
            title: 'Name', 
            dataIndex: 'name', 
            key: 'name', 
            render: t => <Space><CarOutlined /><Text strong>{t}</Text></Space> 
        },
        { 
            title: 'Plate #', 
            dataIndex: 'plate_number', 
            key: 'plate', 
            render: t => <Tag>{t}</Tag> 
        },
        {
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: s => <Tag color={VEHICLE_STATUS_COLORS[s] || 'default'}>{s.replace('_', ' ')}</Tag>
        },
        {
            title: 'Driver', 
            dataIndex: 'current_driver_id', 
            key: 'driver',
            render: did => drivers.find(d => d.id === did)?.name || <Text type="secondary">Unassigned</Text>
        },
        {
            title: 'Capacity',
            key: 'capacity',
            render: (_, r) => <Space direction="vertical" size={4} style={{ minWidth: 150 }}>
                <Progress percent={Math.round(r.weight_capacity > 0 ? (r.current_weight_used / r.weight_capacity) * 100 : 0)} size="small" strokeColor="#facc15" />
                <Text type="secondary" style={{ fontSize: 11 }}>{r.current_weight_used}/{r.weight_capacity} kg</Text>
                <Progress percent={Math.round(r.volume_capacity > 0 ? (r.current_volume_used / r.volume_capacity) * 100 : 0)} size="small" strokeColor="#facc15" />
                <Text type="secondary" style={{ fontSize: 11 }}>{r.current_volume_used}/{r.volume_capacity} m³</Text>
            </Space>
        },
        {
            title: 'Actions', 
            key: 'actions', 
            width: 120,
            render: (_, r) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button 
                            icon={<EditOutlined />} 
                            size="small" 
                            onClick={() => {
                                setEditingVehicle(r);
                                form.setFieldsValue(r);
                                setIsModalOpen(true);
                            }} 
                        />
                    </Tooltip>
                    <Tooltip title="3D Cargo View"><Button icon={<EyeOutlined />} size="small" onClick={() => setCargoViewVehicle(r)} /></Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            danger 
                            onClick={() => handleDelete(r.id)} 
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Vehicle Fleet Management</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => { 
                        setEditingVehicle(null); 
                        form.resetFields(); 
                        setIsModalOpen(true); 
                    }}
                    style={{ background: '#facc15', borderColor: '#facc15', color: '#000' }}
                >
                    Add Vehicle
                </Button>
            </div>

            <Card size="small" style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Select mode="multiple" allowClear placeholder="Filter by status" style={{ minWidth: 220 }} value={filters.status} onChange={status => setFilters(current => ({ ...current, status }))}
                        options={Object.keys(VEHICLE_STATUS_COLORS).map(value => ({ value, label: value.replace('_', ' ') }))} />
                    <Switch checked={!!filters.overloaded} onChange={overloaded => setFilters(current => ({ ...current, overloaded }))} />
                    <Text>Overloaded only</Text>
                    <Button onClick={() => fetchVehiclesAndDrivers(filters)}>Filter</Button>
                    <Button onClick={() => { setFilters({}); fetchVehiclesAndDrivers({}); }}>Reset</Button>
                </Space>
            </Card>

            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={vehicles}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            </Card>

            <Modal 
                title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'} 
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditingVehicle(null); form.resetFields(); }}
                footer={null} 
                width={540}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Vehicle Name" rules={[{ required: true }]}>
                        <Input placeholder="Enter vehicle name" />
                    </Form.Item>
                    <Form.Item name="plate_number" label="Plate Number" rules={[{ required: true }]}>
                        <Input placeholder="Enter plate number" />
                    </Form.Item>
                    <Form.Item name="vehicle_type" initialValue="TRUCK" hidden><Input /></Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="weight_capacity" label="Weight Capacity (kg)" initialValue={1000}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="volume_capacity" label="Volume Capacity (m³)" initialValue={10}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="current_driver_id" label="Assigned Driver">
                        <Select allowClear placeholder="Select a driver" options={
                            drivers.map(d => {
                                const assignedVeh = vehicles.find(v => v.current_driver_id === d.id);
                                const isOther = assignedVeh && assignedVeh.id !== editingVehicle?.id;
                                return {
                                    value: d.id,
                                    label: `${d.name} (${d.email}) ${isOther ? `[Currently on ${assignedVeh.plate_number}]` : ''}`,
                                    disabled: isOther
                                };
                            })
                        } />
                    </Form.Item>

                    {editingVehicle && (
                        <Form.Item name="status" label="Status">
                            <Select options={Object.keys(VEHICLE_STATUS_COLORS).map(k => ({ 
                                value: k, 
                                label: k.replace('_', ' ') 
                            }))} />
                        </Form.Item>
                    )}

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" style={{ background: '#facc15', borderColor: '#facc15', color: '#000' }}>
                                {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
            <Modal title={cargoViewVehicle ? `${cargoViewVehicle.name} · ${cargoViewVehicle.plate_number}` : 'Cargo View'} open={!!cargoViewVehicle} onCancel={() => setCargoViewVehicle(null)} footer={null} width={800}>
                {cargoViewVehicle && <div style={{ height: 420 }}><TruckCargoVisualizer weightUsed={cargoViewVehicle.current_weight_used} weightCapacity={cargoViewVehicle.weight_capacity} volumeUsed={cargoViewVehicle.current_volume_used} volumeCapacity={cargoViewVehicle.volume_capacity} vehicleType={cargoViewVehicle.vehicle_type} vehicleName={cargoViewVehicle.name} plateNumber={cargoViewVehicle.plate_number} height="100%" style={{ width: '100%', height: '100%' }} showLabels={false} /></div>}
            </Modal>
        </div>
    );
}
