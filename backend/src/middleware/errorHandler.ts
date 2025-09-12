import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('\n=== ERROR OCCURRED ===');
  console.error('URL:', req.method, req.url);
  console.error('Error Message:', error.message);
  console.error('Error Stack:', error.stack);
  console.error('======================\n');

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  if (error.message.includes('File too large')) {
    return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed' });
  }

  res.status(500).json({ error: 'Internal server error' });
};