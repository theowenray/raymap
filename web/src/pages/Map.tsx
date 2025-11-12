import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { useAuth } from '../context/AuthContext';
import PropertyPanel from '../components/PropertyPanel';

type PropertyFeature = Feature<
  Geometry,
  {
    parcelId: string;
    owner: string;
    acreage: number;
    address?: string;
  }
>;

type PropertyFeatureCollection = {
  type: 'FeatureCollection';
  features: PropertyFeature[];
};

type Property = {
  parcelId: string;
  owner: string;
  acreage: number;
  address?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/.netlify/functions';

const MapPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const parcelLayerRef = useRef<L.GeoJSON | null>(null);
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [panelMessage, setPanelMessage] = useState('Select a parcel to see owner and acreage.');

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(containerRef.current).setView([39.406, -88.807], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    const loadParcels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/properties`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to load parcel data');
        }
        const data: PropertyFeatureCollection = await response.json();
        if (parcelLayerRef.current) {
          parcelLayerRef.current.remove();
        }

        parcelLayerRef.current = L.geoJSON<PropertyFeature>(data, {
          style: () => ({
            color: '#2563eb',
            weight: 1.5,
            fillColor: '#3b82f6',
            fillOpacity: 0.25
          }),
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {
              if (feature.properties?.parcelId) {
                void handleParcelClick(feature.properties.parcelId);
              }
            });
          }
        }).addTo(map);
      } catch (error) {
        console.error(error);
        setPanelMessage('Unable to load parcel data.');
      }
    };

    void loadParcels();

    return () => {
      parcelLayerRef.current?.remove();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleParcelClick = async (parcelId: string) => {
    setLoadingProperty(true);
    setPanelMessage('Loading property details…');
    try {
      const response = await fetch(
        `${API_BASE_URL}/property?parcelId=${encodeURIComponent(parcelId)}`,
        {
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error('Failed to load property');
      }
      const data: { property: Property } = await response.json();
      setSelected(data.property);
      setPanelMessage('');
    } catch (error) {
      console.error(error);
      setPanelMessage('Unable to load property details.');
      setSelected(null);
    } finally {
      setLoadingProperty(false);
    }
  };

  return (
    <div className="map-layout">
      <div ref={containerRef} className="map-container" aria-label="Shelby County map" />
      <aside className="map-panel" aria-live="polite">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Property details</h2>
            <div className="placeholder">Signed in as {user?.username}</div>
          </div>
          <button className="logout-button" type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
        <PropertyPanel property={selected} loading={loadingProperty} message={panelMessage} />
      </aside>
    </div>
  );
};

export default MapPage;
