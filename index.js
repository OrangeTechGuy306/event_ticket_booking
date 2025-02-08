const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const eventRouter = require('./routes/eventTicketRoute');
const userRouter = require('./routes/userAuthRoute');
const cors = require("cors")
require('dotenv').config();


const app = express();



app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended: true}))



// LIMITING THE API CALL 
const rateLimiter = new RateLimiterMemory({
    points: 1,
    duration: 1, 
  });

  app.use(async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip); 
      next();
    } catch (error) {
      res.status(429).json({message:'too many requests'});
    }
  });


//   API ROUTES
app.use("/", eventRouter);
app.use("/", userRouter);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = {app, server}
