const paginate = (defaultLimit = 10, maxLimit = 100) => {
  return (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || defaultLimit;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt'; // Default sort by creation date descending

    req.pagination = {
      page,
      limit: Math.min(limit, maxLimit), // Ensure limit doesn't exceed maxLimit
      skip,
      sort,
    };
    next();
  };
};

export default paginate;
