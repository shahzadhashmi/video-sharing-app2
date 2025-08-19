import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Access Denied: No token provided' 
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Access Denied: Invalid token format' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    return res.status(403).json({ 
      success: false,
      message: 'Access Denied' 
    });
  }
};

export default verifyToken;
