  // const mongoose = require("mongoose");

  // const restroSchema = new mongoose.Schema({
  //   restaurantName: { type: String, required: true },
  //   ownerName: { type: String, required: true },
  //   email: { type: String, required: true, unique: true },
  //   phone: { type: String, required: true },
  //   password: { type: String, required: true },
  //   location: {
  //     shopNo: { type: String, required: true },
  //     floorNo: { type: String, required: true },
  //     area: { type: String, required: true },
  //     city: { type: String, required: true },
  //   },
  //   time: {
  //     open: { type: String, required: true },
  //     close: { type: String, required: true },
  //   },
  //   cuisine: { type: String, required: true },
  //   image: { type: String},
  //   resetPasswordToken: { type: String},
  //   resetPasswordExpire: { type: Date},
  //   createdAt: { type: Date, default: Date.now }
    
  // });

  // const RestroData = mongoose.model("RestaurantData", restroSchema);
  // module.exports = RestroData;
  // const mongoose = require('mongoose')

  // const restaurantSchema = mongoose.Schema({
  //     name: String,
  //     address: String,
  //     image: [String],
  //     cusine: String,
  //     description: String,
  //     promoted: Boolean,
  //     rating: Number,
  //     time: String,
  // })

  // const RestaurantModel= mongoose.model("restaurant",restaurantSchema)

  // module.exports = RestaurantModel

  const mongoose = require("mongoose");

  const restroSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    location: {
      shopNo: { type: String, required: true },
      floorNo: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
    },
    time: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    cuisine: { type: String, required: true },
    profileImg: { type: String},
    resetPasswordToken: { type: String},
    resetPasswordExpire: { type: Date},
    createdAt: { type: Date, default: Date.now },
    image: [String],
    rating: {type:Number,required:false},
    description: { type: String },
      promoted: { type: Boolean, default: false },
    cordinates: {
        latitude:{type: Number},
        longitude:{type: Number} 
        },
    pureVeg:{type:Boolean,default:true}
  });

  const RestaurantModel = mongoose.model("restaurantdata", restroSchema);
  module.exports = RestaurantModel;