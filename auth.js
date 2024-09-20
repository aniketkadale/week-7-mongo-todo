const JWT_SECRET = "randomsecret";
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.headers.token;
    const verifiedToken = jwt.verify(token, JWT_SECRET);

    if (verifiedToken) {
      req.userId = verifiedToken.id;
      next();
    } else {
      res.status(403).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET,
};
