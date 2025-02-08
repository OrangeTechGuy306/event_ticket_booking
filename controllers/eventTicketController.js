const { SQL } = require("../sql");

module.exports.createEvent = (req, res) => {
  const { name, tickets } = req.body;

  try {
    if (!name || !tickets) {
      res.status(400).json({ message: "Invalid name OR ticket" });
    } else {
      SQL.getConnection((e, con) => {
        if (e) {
          res.status(500).json({ message: "Error connecting to DB" });
        } else {
          con.query(
            "SELECT * FROM events WHERE name = ?",
            [name],
            (er, event) => {
              if (er) {
                res.status(500).json({ message: "Error DB query" });
              } else {
                if (event.length === 0) {
                  con.query(
                    "INSERT INTO events (name, tickets) VALUES (?, ?)",
                    [name, tickets],
                    (error, result) => {
                      if (error) {
                        res
                          .status(500)
                          .json({ message: "Error creatinng event" });
                      } else {
                        res.status(201).json({ message: "Event Created" });
                      }
                    }
                  );
                } else {
                  res.status(400).json({ message: "Event Already exist" });
                }
              }
            }
          );
          con.release();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message ?? "Something went wrong" });
  }
};

module.exports.bookTicket = (req, res) => {
  const { eventId } = req.body;
  const { id } = req.user;

  try {
    if (!eventId) {
      return res.status(400).json({ error: "Invalid Event ID" });
    } else {
      SQL.getConnection((e, con) => {
        if (e) {
          res.status(500).json({ message: "Error connecting to DB" });
        } else {
          con.query(
            `SELECT * FROM bookings WHERE event_id = ? AND user_id`,
            [eventId, id],
            (errorMessage, booking) => {
              if (errorMessage) {
                res
                  .status(500)
                  .json({ message: "Error verifying user booking" });
              } else {
                if (booking.length > 0) {
                  res
                    .status(400)
                    .json({ message: "You already book this event" });
                } else {
                  con.query(
                    "SELECT tickets FROM events WHERE id = ?",
                    [eventId],
                    (er, bookingTicket) => {
                      if (er) {
                        res
                          .status(500)
                          .json({ message: "Error fetching ticket" });
                      } else {
                        const ticket = parseInt(bookingTicket[0].tickets);
                        if (bookingTicket.length === 0 || ticket <= 0) {
                          con.query(
                            "INSERT INTO waiting_list(user_id, event_id) VALUES(?, ?)",
                            [id, eventId],
                            (errorResponse, _) => {
                              if (errorResponse) {
                                res.status(500).json({
                                  message:
                                    "Error adding user to the waiting list",
                                });
                              } else {
                                return res.status(201).json({
                                  message:
                                    "No tickets available, you are added to waiting list",
                                });
                              }
                            }
                          );
                        } else {
                          con.query(
                            "UPDATE events SET tickets = tickets - 1 WHERE id = ?",
                            [eventId],
                            (err, updatedTicket) => {
                              if (err) {
                                res.status(500).json({
                                  message: "Error Updating Event ticket",
                                });
                              } else {
                                con.query(
                                  "INSERT INTO bookings(user_id, event_id) VALUES (?, ?)",
                                  [id, eventId],
                                  (error, bookings) => {
                                    if (error) {
                                      res.status(500).json({
                                        message: "Error booking ticket",
                                      });
                                    } else {
                                      res
                                        .status(201)
                                        .json({ message: "Ticket booked" });
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              }
            }
          );
          con.release();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to book ticket" });
  }
};

module.exports.cancelBooking = (req, res) => {
  const { eventId } = req.body;
  const { id } = req.user;
  try {
    if (!eventId) {
      res.status(400).json({ message: "Invalid event ID" });
    } else {
      SQL.getConnection((e, con) => {
        if (e) {
          res.status(500).json({ message: "Error connecting to DB" });
        } else {
          con.query(
            "SELECT id FROM bookings WHERE user_id = ? AND event_id = ?",
            [id, eventId],
            (er, result) => {
              if (er) {
                res.status(500).json({ message: "Error connecting to DB" });
              } else {
                if (result.length > 0) {
                  const bookingID = result[0].id;
                  con.query(
                    "DELETE FROM bookings WHERE id = ?",
                    [bookingID],
                    (err, deletedBooking) => {
                      if (err) {
                        res
                          .status(500)
                          .json({ message: "Can not cancel event" });
                      } else {
                        con.query(
                          "SELECT * FROM waiting_list WHERE event_id = ? ORDER BY created_at ASC LIMIT 1",
                          [eventId],
                          (erro, waitingBooking) => {
                            if (erro) {
                              res.status(500).json({
                                message: "Error query in updating waiting list",
                              });
                            } else {
                              if (waitingBooking.length > 0) {
                                const nextUser = waitingBooking[0].id;
                                con.query(
                                  "INSERT INTO bookings (user_id, event_id) VALUES (?, ?)",
                                  [nextUser, eventId],
                                  (error, booked) => {
                                    if (error) {
                                      res.status(500).json({
                                        message:
                                          "Error assigning ticket to the next user",
                                      });
                                    } else {
                                      con.query(
                                        "DELETE FROM waiting_list WHERE id = ?",
                                        [nextUser],
                                        (errorResponse, _) => {
                                          if (errorResponse) {
                                            res.status(500).json({
                                              message:
                                                "Error removing user from the waiting list",
                                            });
                                          } else {
                                            res.status(201).json({
                                              message:
                                                "Booking canceled and ticket has been assigned to another user on the waiting list",
                                            });
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              } else {
                                con.query(
                                  "UPDATE events SET tickets = tickets + 1 WHERE id = ?",
                                  [eventId],
                                  (error, ticket) => {
                                    if (error) {
                                      res.status(500).json({
                                        message: "Error Updating ticket",
                                      });
                                    } else {
                                      res.status(201).json({
                                        message:
                                          "Booking Canceled, ticket now available to other users",
                                      });
                                    }
                                  }
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  res
                    .status(400)
                    .json({ message: "You did not book this event" });
                }
              }
            }
          );
          con.release();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message ?? "something went wrong" });
  }
};

module.exports.eventTicketStatus = (req, res) => {
  const { eventId } = req.body;

  try {
    if (!eventId) {
      res.status(400).json({ message: "Invalid Event ID" });
    }
    {
      SQL.getConnection((e, con) => {
        if (e) {
          res.status(500).json({ message: "Error connecting to DB" });
        } else {
          con.query(
            `SELECT events.name AS event_name, events.tickets AS available_tickets, COUNT(bookings.event_id) AS total_ticket_booked FROM events LEFT JOIN bookings ON bookings.event_id = events.id WHERE events.id = ?;`,
            [eventId],
            (er, events) => {
              if (er) {
                res
                  .status(500)
                  .json({ message: "unable to fetch ticket status" });
              } else {
                res.status(201).json({ message: events });
              }
            }
          );
          con.release();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message ?? "Something went wrong" });
  }
};
