const errorHandler = (err, req, res, next) => {
  console.error(err?.stack || err);
  
  // Handle custom status codes
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value entered' });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value entered' });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
};

export default errorHandler;
