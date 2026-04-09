import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import lieuxRouter from './routes/lieux';

dotenv.config();

const app = express();

// PORT dynamique pour Render
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Configuration PostgreSQL Render
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }, // Obligatoire pour Render
});

// Tester la connexion PostgreSQL
pool.connect()
  .then(() => console.log("✅ Connexion PostgreSQL réussie !"))
  .catch((err) => console.error("❌ Erreur connexion PostgreSQL: ", err));

app.use(cors());
app.use(express.json());

// Router lieux avec logs détaillés
app.use('/api/lieux', async (req, res, next) => {
  try {
    await lieuxRouter(req, res, next);
  } catch (err) {
    console.error('❌ Erreur router /api/lieux:', err);
    
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Dakar GeoExplorer API opérationnelle' });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur port ${PORT}`);
  console.log(`   → GET /api/lieux`);
  console.log(`   → GET /api/lieux?type=hôpital`);
  console.log(`   → GET /api/lieux/search?q=sandaga`);
  console.log(`   → GET /api/lieux/proches?lng=-17.44&lat=14.68&limit=5`);
});

export { pool };