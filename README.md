# EVENT TICKET BOOKING
A ticket booking system with user authentication, event creation, ticket booking, waiting list management, and cancellation functionality through concurrency handling and provides users with available and booked tickets.

# Table of Contents
1. Project Overview
2. Setup & Installation
3. API Endpoints
4. User Authentication
5. Event Ticket Booking
6. Concurrency Handling
7. Testing
8. Error Handling
9. Rate Limiting
10. Design Decisions

# Project Overview

This project allows users to:
1. Register and log in with a JWT-based authentication system.
2. Create events with a specific number of available tickets.
3. Book tickets for events, with an automatic waiting list when tickets are sold out for that event.
4. Cancel event bookings, with automatic reassignment of tickets to the next person in the waiting list (if any).
5. View event statuses including available tickets and the number of bookings for a specific event.

# Setup & Installation
1. clone repository:
   
		git clone https://github.com/yourusername/event_ticket_booking.git
		cd event_ticket_booking

2. Install the dependencies:
	
   		npm install

3. Set up environment variables: Create a .env file at the root of the project and add the following:

	   JWT_SECRET=your_jwt_secret_key
   	   DB_HOST=your_database_host
	   DB_USER=your_database_user
	   DB_PASS=your_database_password
	   DB_NAME=your_database_name

5. Run the server:

       npm start

	
# API Endpoints
1. POST /register: Register a new user.

Request Body:

	   {
	     "username": "user123",
	     "password": "password123"
	   }
    
Response:

   	{
  	   "message": "Registration Successful"
	}

2. POST /login: Log in to an existing account and receive a JWT token.

	    	{
		   "username": "user123",
		   "password": "password123"
		}

Response:

		{
		  "token": "your_jwt_token"
		}

# Event Ticket Booking

1. Create a new event with available tickets: POST /initialize
. Request Body:

	   {
		"name": "Concert 2025",
		"tickets": 100
	   }

. Headers:

 	{
	   "Authorization": "jwt_token"
	}

Response:

	{
  	  "message": "Event Created"
	}

2. POST /book: Book a ticket for an event. If tickets are sold out, the user is added to the waiting list.

. Request Body:

     	{
  	  "eventId": 1
	}

 .Headers:

 	{
	   "Authorization": "jwt_token"
	}

. Response:
     
     	{
  	  "message": "Ticket booked"
	}

3. POST /cancel: Cancel a booking for an event.

. Request Body:

	{
  	  "eventId": 1
	}

 . Headers:

 	{
	   "Authorization": "jwt_token"
	}

Response: if no user on the waiting list to assign the ticket to.

	{
  	  "message": "Booking canceled, ticket now available to other users"
	}
 . Headers:

 	{
	   "Authorization": "jwt_token"
	}

Response: When there is user on the waiting list to assign the ticket to.

	{
  	 "message": "Booking canceled, ticket assigned to another user on the waiting list"
	}

4. GET /status: Check the current status of an event (available tickets and total bookings).

. Query Parameters

	{
	    http://localhost:5000/status/${eventId}
	}

. Headers:

 	{
	   "Authorization": "jwt_token"
	}
 
Response:

	{
	   "event_name": "Concert 2025",
	   "available_tickets": 98,
	   "total_ticket_booked": 2
	}



# Concurrency Handling
The system implements concurrency handling in the ticket booking and cancellation operations. When a user books or cancels a ticket, race conditions are managed by checking the available tickets before processing bookings. If the event is sold out, users are added to the waiting list.


# Testing
I have face a lot of issues while trying to perform unit testing on the code. Which I was not able to debug due to the deadline.
I hope and I wish that this does not disqualified me from the interview process. 
The test folder is on the root folder where I am running the test from. Not all the test passed.


# Error Handling
All API routes include error handling for common issues such as:
1. Missing fields in the request body.
2. Invalid or expired JWT token.
3. Database connection errors.
4. Race conditions during ticket booking or cancellation.
5. Error responses include meaningful status codes and error messages to assist with debugging.


# Rate Limiting
Rate limiting is implemented using the rate-limiter-flexible library to prevent abuse of the API. Users are limited to one request per second, and excess requests will result in a 429 Too Many Requests error.

	const rateLimiter = new RateLimiterMemory({
	    points: 1, // 1 request
	    duration: 1, // per second
	});


# Design Decisions

1. JWT Authentication: Used for secure user authentication. Tokens are stored in the Authorization header.
2. MySQL Database: Used to store user, event, and booking information. SQL queries ensure efficient and reliable data management.
3. Middleware Authentication: The authenticate middleware ensures that only authenticated users can book or cancel tickets.


 
