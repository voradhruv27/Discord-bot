//Global error handling middleware for the Express application.

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.response?.status || 500;
  const errorDetails = err.response?.data 
    ? JSON.stringify(err.response.data) 
    : err.stack || err.message;
  
  console.error("Backend Error Handler:", errorDetails);
  
  res.status(statusCode).json({ 
    error: err.message || "Internal Server Error" 
  });
};

module.exports = errorHandler;
