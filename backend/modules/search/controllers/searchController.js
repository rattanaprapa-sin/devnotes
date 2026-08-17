const searchService = require('../services/searchService');
const { createResponse } = require('../../../utils/responseHandler');

const globalSearch = async (req, res, next) => {
  try {
    if (!req.supabase) throw new Error('Supabase not configured');
    const userId = req.user.id;
    const { q } = req.query;

    if (!q) {
      return res.status(200).json(createResponse(true, 'Empty search', { notebooks: [], notes: [] }));
    }

    const results = await searchService.globalSearch(req.supabase, userId, q);
    res.status(200).json(createResponse(true, 'Search results retrieved successfully', results));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};
