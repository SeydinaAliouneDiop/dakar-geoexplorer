import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import lieuxRouter from './routes/lieux';

dotenv.config();
const API_URL = "https://dakar-geoexplorer.onrender.com/api/lieux";
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }, // Obligatoire pour Render
});


pool.connect()
  .then(() => console.log("✅ Connexion PostgreSQL réussie !"))
  .catch((err) => console.error("❌ Erreur connexion PostgreSQL: ", err));


app.use(cors());
app.use(express.json());


app.use('/api/lieux', lieuxRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Dakar GeoExplorer API opérationnelle' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   → GET /api/lieux`);
  console.log(`   → GET /api/lieux?type=hôpital`);
  console.log(`   → GET /api/lieux/search?q=sandaga`);
  console.log(`   → GET /api/lieux/proches?lng=-17.44&lat=14.68&limit=5`);
});

export { pool }; 