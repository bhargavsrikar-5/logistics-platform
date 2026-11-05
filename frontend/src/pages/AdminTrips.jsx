import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const statusColor = {
  PLANNED: 'blue',
  IN_PROGRESS: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export default function AdminTrips() {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);


  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tripRes, shipmentRes, vehicleRes, userRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/trips`, authConfig(token)),
        axios.get(`${API_BASE_URL}/shipments`, { ...authConfig(token), params: { status: 'PENDING' } }),
        axios.get(`${API_BASE_URL}/vehicles`, { ...authConfig(token), params: { status: 'AVAILABLE' } }),
        axios.get(`${API_BASE_URL}/users`, authConfig(token)),
      ]);
      setTrips(Array.isArray(tripRes.data) ? tripRes.data : []);
      setShipments(Array.isArray(shipmentRes.data) ? shipmentRes.data.filter((item) => item.status === 'PENDING') : []);
      setVehicles(Array.isArray(vehicleRes.data) ? vehicleRes.data.filter((item) => item.status === 'AVAILABLE') : []);
      setDrivers(Array.isArray(userRes.data) ? userRes.data.filter((item) => item.role === 'DRIVER' && item.is_active) : []);
    } catch (error) {
      message.error(error.response?.data?.detail || 'Unable to load trip planning data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTrip = async (values) => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/trips`, {
        shipment_ids: values.shipment_ids.map(Number),
        vehicle_id: Number(values.vehicle_id),
        driver_id: Number(values.driver_id),
      }, authConfig(token));
      message.success('Trip created and shipments assigned.');
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Trip could not be created.');
    } finally {
      setSaving(false);
    }
  };

  const cancelTrip = async (tripId) => {
    setCancellingId(tripId);
    try {
      await axios.delete(`${API_BASE_URL}/trips/${tripId}`, authConfig(token));
      message.success('Trip cancelled. Pending stops were released.');
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Trip could not be cancelled.');
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    { title: 'Trip', dataIndex: 'trip_number', key: 'trip_number', render: (value) => <Text strong>{value}</Text> },
    { title: 'Driver', key: 'driver', render: (_, row) => row.driver?.name || row.driver?.email || '—' },
    { title: 'Vehicle', key: 'vehicle', render: (_, row) => row.vehicle ? `${row.vehicle.name} · ${row.vehicle.plate_number}` : '—' },
    { title: 'Stops', key: 'stops', render: (_, row) => row.stops?.length ?? 0 },
    { title: 'Distance', dataIndex: 'total_distance_km', key: 'distance', render: (value) => value == null ? '—' : `${Number(value).toFixed(1)} km` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <Tag color={statusColor[value] || 'default'}>{value}</Tag> },
    {
      title: 'Action', key: 'action',
      render: (_, row) => ['PLANNED', 'IN_PROGRESS'].includes(row.status) ? (
        <Popconfirm title="Cancel this trip?" description="Pending shipments in this trip will return to the pending queue." onConfirm={() => cancelTrip(row.id)} okText="Cancel trip" cancelText="Keep trip">
          <Button danger size="small" icon={<StopOutlined />} loading={cancellingId === row.id}>Cancel</Button>
        </Popconfirm>
      ) : '—',
    },
  ];

  const expandedRowRender = (row) => (
    <Table
      size="small"
      pagination={false}
      rowKey="id"
      dataSource={row.stops || []}
      columns={[
        { title: 'Stop', dataIndex: 'sequence_order', key: 'sequence_order', width: 80 },
        { title: 'Tracking number', key: 'tracking', render: (_, stop) => stop.shipment?.tracking_number || `Shipment #${stop.shipment_id}` },
        { title: 'Pickup', key: 'pickup', render: (_, stop) => stop.shipment?.pickup_address || '—' },
        { title: 'Drop', key: 'drop', render: (_, stop) => stop.shipment?.drop_address || '—' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (value) => <Tag>{value}</Tag> },
      ]}
    />
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Trip Planning</Title>
          <Text type="secondary">Group pending shipments into a driver and vehicle trip.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>Refresh</Button>
      </div>

      <Alert
        type="info"
        showIcon
        message="Trip creation uses the current shipment-based API"
        description="Select shipments belonging to your company. The backend checks company ownership, driver and vehicle eligibility, and the combined vehicle capacity before assigning the trip."
      />

      <Card title={<Space><PlusOutlined />Create a trip</Space>}>
        <Form form={form} layout="vertical" onFinish={createTrip}>
          <Form.Item name="shipment_ids" label="Pending shipments" rules={[{ required: true, message: 'Select at least one shipment.' }]}>
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              placeholder="Choose shipments to group into this trip"
              options={shipments.map((shipment) => ({
                value: shipment.id,
                label: `${shipment.tracking_number} · ${shipment.pickup_address} → ${shipment.drop_address}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="vehicle_id" label="Available vehicle" rules={[{ required: true, message: 'Select a vehicle.' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Choose a vehicle"
              options={vehicles.map((vehicle) => ({
                value: vehicle.id,
                label: `${vehicle.name} · ${vehicle.plate_number} · ${vehicle.weight_capacity} kg / ${vehicle.volume_capacity} m³`,
              }))}
            />
          </Form.Item>
          <Form.Item name="driver_id" label="Active driver" rules={[{ required: true, message: 'Select a driver.' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Choose a driver"
              options={drivers.map((driver) => ({ value: driver.id, label: `${driver.name || driver.email} · ${driver.email}` }))}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving} disabled={!shipments.length || !vehicles.length || !drivers.length}>
            Create optimized trip
          </Button>
          {(!shipments.length || !vehicles.length || !drivers.length) && (
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Trip creation needs pending shipments, an available vehicle, and an active driver.
            </Text>
          )}
        </Form>
      </Card>

      <Card title="Company trips">
        {loading ? <div style={{ textAlign: 'center', padding: 36 }}><Spin /></div> : trips.length ? (
          <Table rowKey="id" columns={columns} dataSource={trips} expandable={{ expandedRowRender }} scroll={{ x: 900 }} />
        ) : <Empty description="No trips have been scheduled yet." />}
      </Card>
    </Space>
  );
}
