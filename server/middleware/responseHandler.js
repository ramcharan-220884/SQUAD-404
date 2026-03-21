// Standardized response formatter middleware
const responseHandler = (req, res, next) => {
  res.sendResponse = (data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };

  res.sendError = (message = "Internal Server Error", statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  };

  next();
};

export default responseHandler;
