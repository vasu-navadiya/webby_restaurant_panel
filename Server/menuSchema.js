// const mongoose = require("mongoose");

// const menuSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   category: { type: String, required: true },
//   price: { type: Number, required: true },
//   imageUrl: { type: String, required: true }, // Path to image file
//   createdAt: { type: Date, default: Date.now },
//   restroid : { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
// });

// const MenuItem = mongoose.model("MenuItem", menuSchema);
// module.exports = MenuItem;
const mongoose = require('mongoose');

// Define the schema for individual menu items
const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }
});

// Define the main menu schema that contains an array of menu items
const menuSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant'
    },
    menu: [menuItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('menuitems', menuSchema);