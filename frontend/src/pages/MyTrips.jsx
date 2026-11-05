import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Empty, List, Spin, Tag, Typography, message } from 'antd';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const statusColor = {
  PLANNED: 'blue',
  IN_PROGRESS: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export default function MyTrips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error(error.response?.data?.detail || 'Unable to load your assigned trips.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  return (
    <div>
      <Title level={2}>My Trips</Title>
      <Text type="secondary">Your assigned trip sheets and delivery stops.</Text>
      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin /></div> : trips.length ? (
        <List
          style={{ marginTop: 20 }}
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2 }}
          dataSource={trips}
          renderItem={(trip) => (
            <List.Item>
              <Card title={trip.trip_number} extra={<Tag color={statusColor[trip.status] || 'default'}>{trip.status}</Tag>} style={{ width: '100%' }}>
                <Text type="secondary">Vehicle</Text>
                <div>{trip.vehicle?.name || '—'} {trip.vehicle?.plate_number ? `· ${trip.vehicle.plate_number}` : ''}</div>
                <Text type="secondary">Stops</Text>
                <div>{trip.stops?.length ?? 0}</div>
                <Text type="secondary">Estimated distance</Text>
                <div>{trip.total_distance_km == null ? '—' : `${Number(trip.total_distance_km).toFixed(1)} km`}</div>
                <div style={{ marginTop: 16, fontWeight: 600 }}>Trip sheet</div>
                <List
                  size="small"
                  dataSource={trip.stops || []}
                  locale={{ emptyText: 'No stops listed.' }}
                  renderItem={(stop) => (
                    <List.Item>
                      <div style={{ minWidth: 0 }}>
                        <div>{stop.sequence_order}. {stop.shipment?.tracking_number || `Shipment #${stop.shipment_id}`}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{stop.shipment?.pickup_address || 'Pickup unavailable'} → {stop.shipment?.drop_address || 'Drop unavailable'}</Text>
                      </div>
                      <Tag>{stop.status}</Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </List.Item>
          )}
        />
      ) : <Empty style={{ marginTop: 36 }} description="No trips have been assigned to you." />}
    </div>
  );
}
