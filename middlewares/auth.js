const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization
    const authToken  = token  && token.split(" ")[1]
  try {
      if (!authToken){
        return res.status(401).json({ message: "Unauthorized User" })
      }else{

        const verifyToken = jwt.verify(authToken, process.env.JWT_SECRET)
        if(verifyToken){
            req.user = {id: verifyToken.id}
            next()
        }else{
             return res.status(401).json({message:"Token Expired!"})
        }
      }
  } catch (error) {
    res.status(500).json({ message: error.message ?? "Invalid token" });
  }
};