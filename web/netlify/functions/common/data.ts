import type { Feature, FeatureCollection, Geometry } from 'geojson';
import rawGeojson from '../../data/shelby_parcels_sample.geojson';

type RawProperties = {
  parcelId?: string;
  owner?: string;
  acreage?: number;
  address?: string;
};

type RawFeature = Feature<Geometry, RawProperties>;

type RawFeatureCollection = FeatureCollection<Geometry, RawProperties>;

export type Property = {
  parcelId: string;
  owner: string;
  acreage: number;
  address?: string;
};

export type PropertyFeature = Feature<Geometry, Property>;
export type PropertyFeatureCollection = FeatureCollection<Geometry, Property>;

const propertyIndex = new Map<string, Property>();

const features: PropertyFeature[] = (rawGeojson as RawFeatureCollection).features.reduce(
  (acc: PropertyFeature[], feature: RawFeature) => {
    const { parcelId, owner, acreage, address } = feature.properties ?? {};

    if (!parcelId || typeof owner !== 'string' || typeof acreage !== 'number') {
      return acc;
    }

    const property: Property = {
      parcelId,
      owner,
      acreage,
      address
    };

    propertyIndex.set(parcelId, property);
    acc.push({
      type: 'Feature',
      geometry: feature.geometry,
      properties: property
    });

    return acc;
  },
  []
);

export const propertiesCollection: PropertyFeatureCollection = {
  type: 'FeatureCollection',
  features
};

export const getProperty = (parcelId: string): Property | null => {
  return propertyIndex.get(parcelId) ?? null;
};
