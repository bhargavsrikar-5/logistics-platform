import { useEffect, useRef, useState } from 'react';

/**
 * LocationPickerMap — Leaflet-based map for selecting a location.
 * Props:
 *   onLocationSelect({ lat, lng, address }) — called when user picks a location.
 *   initialPosition — optional [lat, lng] to start from.
 *   flyTo — [lat, lng, key] — when key changes, map flies to lat/lng and drops a pin.
 */
export default function LocationPickerMap({ onLocationSelect, initialPosition, flyTo }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const pendingFlyTo = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (window.L && mapRef.current && !mapInstanceRef.current) {
            initMap();
            return;
        }

        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => initMap();
            document.head.appendChild(script);
        } else {
            initMap();
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // When flyTo prop changes, fly the map (or store pending if not ready)
    useEffect(() => {
        if (!flyTo) return;
        const [lat, lng] = flyTo;
        if (isNaN(lat) || isNaN(lng)) return;

        if (mapInstanceRef.current) {
            doFlyTo(lat, lng);
        } else {
            // Map not ready yet — store and apply once initMap runs
            pendingFlyTo.current = [lat, lng];
        }
    }, [flyTo]);

    const doFlyTo = (lat, lng) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = window.L.marker([lat, lng]).addTo(map);
        }

        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(r => r.json())
            .then(data => {
                const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                markerRef.current?.bindPopup(address).openPopup();
                if (onLocationSelect) onLocationSelect({ lat, lng, address });
            })
            .catch(() => {
                if (onLocationSelect) onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
            });
    };

    const initMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const defaultCenter = initialPosition || [12.97, 77.59];
        const map = window.L.map(mapRef.current).setView(defaultCenter, 13);
        mapInstanceRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        setLoading(false);

        // Apply any pending flyTo that came in before map was ready
        if (pendingFlyTo.current) {
            const [lat, lng] = pendingFlyTo.current;
            pendingFlyTo.current = null;
            setTimeout(() => doFlyTo(lat, lng), 300);
        }

        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = window.L.marker([lat, lng]).addTo(map);
            }

            let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );
                const data = await res.json();
                if (data.display_name) {
                    address = data.display_name;
                    markerRef.current.bindPopup(address).openPopup();
                }
            } catch {
                // fallback
            }

            if (onLocationSelect) {
                onLocationSelect({ lat, lng, address });
            }
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f0f2f5', color: '#8c8c8c', fontSize: 14
                }}>
                    Loading Map...
                </div>
            )}
        </div>
    );
}
