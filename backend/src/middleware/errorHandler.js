import mongoose from 'mongoose';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  
  console.error("DEBUG ERROR:", err); // Log the full error to terminal

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 ? 'Something went wrong. Please try again later.' : err.message;

  return res.status(status).json({ success: false, message });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Resource not found' });
}
