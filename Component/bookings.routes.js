const express = require('express');
const router = express.Router();
const bookingController = require('../Component/bookings.controller');

// Create booking
router.post('/bookings', bookingController.createBooking);

// Get all bookings
router.get('/bookings', bookingController.getAllBookings);

// Get booking by ID
router.get('/bookings/:id', bookingController.getBookingById);

// Update booking
router.put('/bookings/:id', bookingController.updateBooking);

// Delete booking
router.delete('/bookings/:id', bookingController.deleteBooking);

module.exports = router;
