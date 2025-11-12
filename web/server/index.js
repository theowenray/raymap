import express from 'express';
import session from 'express-session';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT ?? 4000);
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'raymap-dev-secret';
const AUTH_USERNAME = process.env.AUTH_USERNAME ?? 'planner';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? 'raymap';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

const dataPath = path.resolve(
  __dirname,
  '../../Raymap/Resources/Data/shelby_parcels_sample.geojson'
);
const geojson = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const propertyIndex = new Map();
const features = geojson.features.reduce((acc, feature) => {
  const { parcelId, owner, acreage, address } = feature.properties ?? {};
  if (!parcelId) {
    return acc;
  }
  const property = { parcelId, owner, acreage, address };
  propertyIndex.set(parcelId, property);
  acc.push({
    type: 'Feature',
    geometry: feature.geometry,
    properties: property
  });
  return acc;
}, []);

const featureCollection = {
  type: 'FeatureCollection',
  features
};

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

const ensureAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
    req.session.user = { username };
    return res.json({ user: { username } });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  } else {
    res.json({ ok: true });
  }
});

app.get('/api/session', (req, res) => {
  res.json({ user: req.session?.user ?? null });
});

app.get('/api/properties', ensureAuthenticated, (req, res) => {
  res.json(featureCollection);
});

app.get('/api/properties/:parcelId', ensureAuthenticated, (req, res) => {
  const { parcelId } = req.params;
  const property = propertyIndex.get(parcelId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }
  return res.json({ property });
});

export const startServer = (port = PORT) =>
  app.listen(port, () => {
    console.log(`Raymap web server listening on http://localhost:${port}`);
  });

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
