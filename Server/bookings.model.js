// const mongoose = require('mongoose');


// const bookingsSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
//   membersCount: { type: Number, required: true },
//   selectedDate: { type: String, required: true },
//   selectedTimeSlot: { type: String, required: true },
// });

// const BookingsModel = mongoose.model("Booking", bookingsSchema);

// module.exports = BookingsModel;  
const mongoose = require('mongoose');
const bookingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
  membersCount: { type: Number, required: true },
  selectedDate: { type: String, required: true },
  selectedTimeSlot: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
  // monthly:{type:Number}
});
const BookingsModel = mongoose.model("booking", bookingsSchema);
module.exports = BookingsModel;