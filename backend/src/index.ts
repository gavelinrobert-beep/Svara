import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { leadsRouter } from './routes/leads';
import { authRouter } from './routes/auth';
import { categoriesRouter } from './routes/categories';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/categories', categoriesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Svara Backend' });
});

app.listen(PORT, () => {
  console.log(`Svara backend körs på port ${PORT}`);
});

export default app;
