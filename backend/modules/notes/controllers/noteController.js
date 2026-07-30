const noteService = require('../services/noteService');
const { createResponse } = require('../../../utils/responseHandler');

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management APIs
 */

/**
 * @swagger
 * /api/notes/notebook/{notebookId}:
 *   get:
 *     summary: Get all notes for a specific notebook
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notebookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notes
 */
const getNotesByNotebookId = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const { page, limit } = req.query;
    const result = await noteService.getNotesByNotebookId(req.supabase, req.params.notebookId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12
    });
    res.json(createResponse(true, 'Notes retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notebookId:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created
 */
const createNote = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await noteService.createNote(req.supabase, req.user.id, req.body);
    res.status(201).json(createResponse(true, 'Note created successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}/pin:
 *   post:
 *     summary: Toggle pin status of a note
 *     tags: [Notes]
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
const togglePinNote = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await noteService.togglePinNote(req.supabase, req.params.id, req.body.is_pinned);
    res.json(createResponse(true, 'Note pin status updated', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}/update:
 *   post:
 *     summary: Update a note
 *     tags: [Notes]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 */
const updateNote = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await noteService.updateNote(req.supabase, req.params.id, req.body);
    res.json(createResponse(true, 'Note updated successfully', result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notes/{id}/delete:
 *   post:
 *     summary: Delete a note
 *     tags: [Notes]
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
 *         description: Note deleted
 */
const deleteNote = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const result = await noteService.deleteNote(req.supabase, req.params.id);
    res.json(createResponse(true, 'Note deleted successfully', result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotesByNotebookId,
  createNote,
  togglePinNote,
  updateNote,
  deleteNote
};
