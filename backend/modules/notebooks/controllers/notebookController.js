const notebookService = require('../services/notebookService');
const { createResponse } = require('../../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Notebooks
 *   description: Notebook management APIs
 */

/**
 * @swagger
 * /api/notebooks:
 *   get:
 *     summary: Get all notebooks
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notebooks
 */
const getNotebooks = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const { page, limit } = req.query;
    const result = await notebookService.getNotebooks(req.supabase, { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 12 
    });
    res.json(createResponse(true, 'Notebooks retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notebooks/{id}:
 *   get:
 *     summary: Get a single notebook by ID
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notebook details
 */
const getNotebookById = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await notebookService.getNotebookById(req.supabase, req.params.id);
    res.json(createResponse(true, 'Notebook retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notebooks:
 *   post:
 *     summary: Create a new notebook
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notebook created
 */
const createNotebook = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await notebookService.createNotebook(req.supabase, req.user.id, req.body);
    res.status(201).json(createResponse(true, 'Notebook created successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notebooks/{id}/pin:
 *   post:
 *     summary: Toggle pin status of a notebook
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_pinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pin status updated
 */
const togglePinNotebook = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await notebookService.togglePinNotebook(req.supabase, req.params.id, req.body.is_pinned);
    res.json(createResponse(true, 'Notebook pin status updated', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notebooks/{id}/update:
 *   post:
 *     summary: Update a notebook
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notebook updated
 */
const updateNotebook = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await notebookService.updateNotebook(req.supabase, req.params.id, req.body);
    res.json(createResponse(true, 'Notebook updated successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notebooks/{id}/delete:
 *   post:
 *     summary: Delete a notebook
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notebook deleted
 */
const deleteNotebook = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await notebookService.deleteNotebook(req.supabase, req.params.id);
    res.json(createResponse(true, 'Notebook deleted successfully', result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotebooks,
  getNotebookById,
  createNotebook,
  togglePinNotebook,
  updateNotebook,
  deleteNotebook
};
