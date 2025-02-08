const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { createEvent, bookTicket, cancelBooking, eventTicketStatus } = require('../controllers/eventTicketController');

const eventRouter = express.Router();
eventRouter.post('/initialize', createEvent);
eventRouter.post('/book', authenticate, bookTicket);
eventRouter.post('/cancel', authenticate, cancelBooking);
eventRouter.get('/status', authenticate, eventTicketStatus);

module.exports = eventRouter;
