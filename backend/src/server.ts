import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import lieuxRouter from './routes/lieux';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/lieux', lieuxRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Dakar GeoExplorer API opérationnelle' });
});

app.listen(PORT, () => {
  console.log(` Serveur démarré sur port ${PORT}`);
});