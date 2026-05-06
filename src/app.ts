import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { globalErrorHandler } from './middlewares/error.middleware';
import paymentRoutes from './api/routes/payment.routes';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiDocumentation } from './config/swagger';

const app = express();
const openApiSpecification = getOpenApiDocumentation();

app.set('trust proxy', 1);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification));
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.get('/', (req, res) => {
  res.status(200).json('Payment Service');
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
app.use('/api/v1', paymentRoutes);
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});
app.use(globalErrorHandler);

export default app;
