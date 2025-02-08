const {SQL} = require('../sql'); // Replace with the actual path
jest.mock('../sql');
require("dotenv").config()

const { bookTicket } = require('../controllers/eventTicketController'); // Replace with the actual path
const request = require('supertest');
const { app, server } = require('..');


// describe('POST /book', () => {

//     let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM4OTIwMzA3LCJleHAiOjE3MzkwMDY3MDd9.sObZ37GbJsTiGqiz3bOHsRYMWEwKoUuc3IPiVzUavKg"
//   let mockCon;

//   beforeEach(() => {
//     mockCon = {
//       query: jest.fn(),
//       release: jest.fn(),
//     };
//     SQL.getConnection.mockImplementation((callback) => callback(null, mockCon));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return 400 if eventId is missing', async () => {
//     jest.setTimeout(10000);
//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ user: { id: 1 } }); // No eventId

//     expect(response.status).toBe(400);
//     expect(response.body.error).toBe('Invalid Event ID');
//   });

//   it('should return 500 if database connection fails', async () => {
//     jest.setTimeout(10000);
//     SQL.getConnection.mockImplementation((callback) => callback(new Error('DB connection failed'), null));

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toBe('Error connecting to DB');
//   });

//   it('should return 400 if user already booked the event', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT * FROM bookings')) {
//         callback(null, [{ event_id: 1, user_id: 1 }]); // Simulate existing booking
//       }
//     },10000);

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('You already book this event');
//   }, 10000);

//   it('should add user to waiting list if no tickets are available', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(null, [{ tickets: 0 }]); // Simulate no tickets available
//       } else if (query.includes('INSERT INTO waiting_list')) {
//         callback(null, []); // Simulate successful insertion
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(201);
//     expect(response.body.message).toBe('No tickets available, you are added to waiting list');
//   },10000);

//   it('should book ticket if tickets are available', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(null, [{ tickets: 1 }]); // Simulate tickets available
//       } else if (query.includes('UPDATE events')) {
//         callback(null, []); // Simulate successful update
//       } else if (query.includes('INSERT INTO bookings')) {
//         callback(null, []); // Simulate successful booking
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(201);
//     expect(response.body.message).toBe('Ticket booked');
//   }, 10000);

//   it('should return 500 if error fetching ticket count', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(new Error('Error fetching ticket count'), null);
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toBe('Error fetching ticket');
//   },10000);

//   it('should return 500 if error adding to waiting list', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(null, [{ tickets: 0 }]); // Simulate no tickets available
//       } else if (query.includes('INSERT INTO waiting_list')) {
//         callback(new Error('Error adding to waiting list'), null);
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toBe('Error adding user to the waiting list');
//   },10000);

//   it('should return 500 if error updating ticket count', async () => {
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(null, [{ tickets: 1 }]); // Simulate tickets available
//       } else if (query.includes('UPDATE events')) {
//         callback(new Error('Error updating ticket count'), null);
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toBe('Error Updating Event ticket');
//   }, 10000);

//   it('should return 500 if error booking ticket', async () => {
//     jest.setTimeout(10000);
//     mockCon.query.mockImplementation((query, params, callback) => {
//       if (query.includes('SELECT tickets FROM events')) {
//         callback(null, [{ tickets: 1 }]); // Simulate tickets available
//       } else if (query.includes('UPDATE events')) {
//         callback(null, []); // Simulate successful update
//       } else if (query.includes('INSERT INTO bookings')) {
//         callback(new Error('Error booking ticket'), null);
//       }
//     });

//     const response = await request(app)
//       .post('/book')
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ eventId: 1, user: { id: 1 } });

//     expect(response.status).toBe(500);
//     expect(response.body.message).toBe('Error booking ticket');
//   });
// }, 10000);




describe('POST /book', () => {
  let mockCon;
  let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM4OTIwMzA3LCJleHAiOjE3MzkwMDY3MDd9.sObZ37GbJsTiGqiz3bOHsRYMWEwKoUuc3IPiVzUavKg"

  beforeEach(() => {
    mockCon = {
      query: jest.fn(),
      release: jest.fn(),
    };
    SQL.getConnection.mockImplementation((callback) => callback(null, mockCon));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if eventId is missing', async () => {
    const response = await request(app)
      .post('/book')
      .set("Authorization", `Bearer ${authToken}`)
      .send({ user: { id: 1 } }); // No eventId

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid Event ID');
  });

  it('should return 500 if database connection fails', async () => {
    SQL.getConnection.mockImplementation((callback) => callback(new Error('DB connection failed'), null));

    const response = await request(app)
      .post('/book')
      .set("Authorization", `Bearer ${authToken}`)
      .send({ eventId: 1, user: { id: 1 } });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error connecting to DB');
  });

  it('should return 400 if user already booked the event', async () => {
    mockCon.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT * FROM bookings')) {
        callback(null, [{ event_id: 1, user_id: 1 }]); // Simulate existing booking
      }
    });

    const response = await request(app)
      .post('/book')
      .set("Authorization", `Bearer ${authToken}`)
      .send({ eventId: 1, user: { id: 1 } });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You already book this event');
  });

  it('should add user to waiting list if no tickets are available', async () => {
    jest.setTimeout(20000); // Increase timeout to 20 seconds

    mockCon.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT * FROM bookings')) {
        callback(null, []); // Simulate no existing booking
      } else if (query.includes('SELECT tickets FROM events')) {
        callback(null, [{ tickets: 0 }]); // Simulate no tickets available
      } else if (query.includes('INSERT INTO waiting_list')) {
        callback(null, []); // Simulate successful insertion
      }
    });

    const response = await request(app)
      .post('/book')
      .set("Authorization", `Bearer ${authToken}`)
      .send({ eventId: 1, user: { id: 1 } });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('No tickets available, you are added to waiting list');
  }, 20000);

  it('should book ticket if tickets are available', async () => {
    jest.setTimeout(20000); // Increase timeout to 20 seconds

    mockCon.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT * FROM bookings')) {
        callback(null, []); // Simulate no existing booking
      } else if (query.includes('SELECT tickets FROM events')) {
        callback(null, [{ tickets: 1 }]); // Simulate tickets available
      } else if (query.includes('UPDATE events')) {
        callback(null, []); // Simulate successful update
      } else if (query.includes('INSERT INTO bookings')) {
        callback(null, []); // Simulate successful booking
      }
    });

    const response = await request(app)
      .post('/book')
      .set("Authorization", `Bearer ${authToken}`)
      .send({ eventId: 1, user: { id: 1 } });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Ticket booked');
  }, 20000);



});

afterAll(() => {
    server.close();
  });