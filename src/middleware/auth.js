const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const token = req.headers["x-acess-key"];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Authorization token not provided' });
  }

  try {
    const decoded = jwt.verify(token, 'Prince-123');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ status: false, message: 'Invalid token' });
  }
};

  
  module.exports = {
    authenticateUser,
  };
  