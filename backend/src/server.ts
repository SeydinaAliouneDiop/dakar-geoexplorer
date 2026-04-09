
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import lieuxRouter from './routes/lieux';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;


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
