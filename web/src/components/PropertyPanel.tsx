import React from 'react';

type Property = {
  parcelId: string;
  owner: string;
  acreage: number;
  address?: string;
};

type PropertyPanelProps = {
  property: Property | null;
  loading: boolean;
  message?: string;
};

const PropertyPanel: React.FC<PropertyPanelProps> = ({ property, loading, message }) => {
  if (loading) {
    return <p className="placeholder">Loading property details…</p>;
  }

  if (property) {
    return (
      <div>
        <p className="placeholder">Parcel ID: {property.parcelId}</p>
        <h3 style={{ marginBottom: '0.5rem' }}>{property.owner}</h3>
        {property.address ? <p>{property.address}</p> : null}
        <p style={{ fontWeight: 600 }}>{property.acreage.toFixed(2)} acres</p>
      </div>
    );
  }

  const displayMessage = message && message.length > 0 ? message : 'Select a parcel to view more information.';
  return <p className="placeholder">{displayMessage}</p>;
};

export default PropertyPanel;
