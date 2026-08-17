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
const noteCategoryRoutes = require('./modules/noteCategories/routes/noteCategoryRoutes');
const notebookCategoryRoutes = require('./modules/notebookCategories/routes/notebookCategoryRoutes');
const searchRoutes = require('./modules/search/routes/searchRoutes');

app.use('/api/notebooks', authMiddleware, notebookRoutes);
app.use('/api/notes', authMiddleware, noteRoutes);
app.use('/api/note-categories', authMiddleware, noteCategoryRoutes);
app.use('/api/notebook-categories', authMiddleware, notebookCategoryRoutes);
app.use('/api/search', authMiddleware, searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for 404 Route Not Found
app.use(notFoundHandler);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;
