import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/error.middleware.js';
import destinationRoutes from './modules/destinations/destination.routes.js';
import compassRoutes from './modules/access-compass/compass.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import weatherRoutes from './modules/weather/weather.routes.js';
import geocodingRoutes from './modules/geocoding/geocoding.routes.js';
import routingRoutes from './modules/routing/routing.routes.js';
import historyRoutes from './modules/history/history.routes.js';
import tourismRoutes from './modules/tourism/tourism.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/compass', compassRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/geocoding', geocodingRoutes);
app.use('/api/v1/routing', routingRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/tourism', tourismRoutes);

app.use('/uploads', express.static(env.UPLOAD_DIR));

app.use(errorHandler);

export default app;
