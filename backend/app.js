const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security & Optimization Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress payloads
app.use(cors());
app.use(express.json());

// API Request Logging
app.use(morgan('dev')); // e.g., GET /api/notebooks 200 12ms

// Rate Limiting (Max 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', limiter);

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
const authMiddleware = require('./middleware/auth');
const notebookRoutes = require('./modules/notebooks/routes/notebookRoutes');
const noteRoutes = require('./modules/notes/routes/noteRoutes');

app.use('/api/notebooks', authMiddleware, notebookRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for 404 Route Not Found
app.use(notFoundHandler);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;
