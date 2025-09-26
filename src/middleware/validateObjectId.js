import mongoose from 'mongoose';

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    let id;
    
    // Handle different parameter names
    if (paramName === 'productId') {
      id = req.params.productId;
    } else {
      id = req.params[paramName] || req.params.id;
    }
    
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    next();
  };
};

export default validateObjectId;
