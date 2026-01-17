import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import verifyRoutes from './routes/verify';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/verify', verifyRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ZeroKlue Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🔴 Redis: ${process.env.REDIS_URL || 'localhost:6379'}`);
});

export default app;
