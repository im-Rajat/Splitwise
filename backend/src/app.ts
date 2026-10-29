import express from 'express';
import cors from 'cors';
import { errorHandler } from './api/middleware/errorHandler';
import { authRoutes } from './api/routes/authRoutes';
import { groupRoutes } from './api/routes/groupRoutes';
import { memberRoutes } from './api/routes/memberRoutes';
import { expenseRoutes } from './api/routes/expenseRoutes';
import { settlementRoutes } from './api/routes/settlementRoutes';
import { auditLogRoutes } from './api/routes/auditLogRoutes';
import { balanceRoutes } from './api/routes/balanceRoutes';
import { dashboardRoutes } from './api/routes/dashboardRoutes';
import { exportRoutes } from './api/routes/exportRoutes';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);
app.use('/api/groups', expenseRoutes);
app.use('/api/groups', settlementRoutes);
app.use('/api/groups', auditLogRoutes);
app.use('/api/groups', balanceRoutes);
app.use('/api/groups', dashboardRoutes);
app.use('/api/groups', exportRoutes);

// Error handler (must be last)
app.use(errorHandler);
