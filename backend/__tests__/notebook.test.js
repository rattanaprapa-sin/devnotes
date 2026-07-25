// Mock the auth middleware so we don't need a real Supabase connection
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-123' };
    req.supabase = {}; // Mock Supabase client
    next();
  };
});

// Mock the service layer to return dummy data
jest.mock('../modules/notebooks/services/notebookService');

const request = require('supertest');
const app = require('../app');
const notebookService = require('../modules/notebooks/services/notebookService');

describe('Notebook API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a list of notebooks', async () => {
    // Arrange
    const mockNotebooks = [
      { id: 1, title: 'Test Notebook 1', is_pinned: true },
      { id: 2, title: 'Test Notebook 2', is_pinned: false },
    ];
    notebookService.getNotebooks.mockResolvedValue(mockNotebooks);

    // Act
    const res = await request(app).get('/api/notebooks');

    // Assert
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toContain('successfully');
    expect(res.body.data).toEqual(mockNotebooks);
    expect(notebookService.getNotebooks).toHaveBeenCalledTimes(1);
  });

  it('should handle service errors correctly', async () => {
    // Arrange
    const errorMessage = 'Database error';
    notebookService.getNotebooks.mockRejectedValue(new Error(errorMessage));

    // Act
    const res = await request(app).get('/api/notebooks');

    // Assert
    expect(res.statusCode).toEqual(500); // Handled by global error handler
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual(errorMessage);
  });
});
