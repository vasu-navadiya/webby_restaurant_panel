const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const RestroData = require("./Server/Register.js"); // Import your MongoDB model
const Menu = require("./Server/menuSchema.js"); // Updated import
const crypto = require("crypto");
const BookingsModel = require("./Server/bookings.model.js");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const port = 3001;
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET || "polytechnic,themsu";
const cors = require("cors");
app.use(cors());
app.use(express.json({limit: "50mb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true , limit: "50mb"}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs"); // Set EJS as the template engine
app.set("views", path.join(__dirname, "Component")); // Tell Express where to find .ejs files

const { register } = require("module");
const nodemailer = require("nodemailer");
const UserModel = require("./Server/user.model.js");
const fileUpload = require('express-fileupload');




const cloudinary = require("cloudinary").v2;
// const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const RestaurantModel = require("./Server/Register.js");


const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
connectToDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-gallery", // Cloudinary folder name
    format: async (req, file) => "jpeg", // Convert all images to JPEG (optional)
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed formats
  },
});

// Multer Middleware (Using Cloudinary Storage)
const upload = multer({ storage: storage });


app.use(express.static(path.join(__dirname, "../Component")));

// Home route
app.get("/", (req, res) => {
  res.render("LandingPage", { title: "Welcome to Our Platform" });
});
// Serve Register_page.html
app.get("/Register_page", (req, res) => {
  res.render("Register_page"); // This should work now
});




app.post("/Register_page", upload.array("galleryImages", 5), async (req, res) => {
  try {
    const {
      restaurantName,
      ownerName,
      email,
      phone,
      password,
      shopNo,
      floorNo,
      latitude,
      longitude,
      area,
      city,
      open,
      close,
      cuisine,
      restaurantType // Capture the restaurant type (Veg/Non-Veg) from the form
    } = req.body;
    
    // Set pureVeg based on the selected restaurant type
    const pureVeg = restaurantType === "Veg";

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload images to Cloudinary and get URLs
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "restaurant-gallery",
        });
        return result.secure_url;
      })
    );
    // console.log("Request Body:", req.body);
    // const getRandomRating = () => (Math.random() * (5 - 3) + 3).toFixed(1);
    const getRandomRating = () => {
      const ratings = [3.0, 3.5, 4.0, 4.5, 5.0];
      return ratings[Math.floor(Math.random() * ratings.length)];
    };
    

    // Save the restaurant in MongoDB
    const newUser = await RestaurantModel.create({
      restaurantName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      cuisine,
      pureVeg, // Store pureVeg in the database
      location: {
        shopNo,
        floorNo,
        area,
        city,
      },
      cordinates: {
        latitude,
        longitude,
      },
      time: {
        open,
        close,
      },
      image: imageUrls, 
      rating: getRandomRating(), // Save image URLs in MongoDB
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.redirect("/Final_Admin");

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});


app.post("/Login_page", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in MongoDB
    const user = await RestroData.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare entered password with hashed password in MongoDB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    // If password matches, login is successful
    res
      .status(200)
      .json({ message: "Login successful", redirect: "/Dashboard" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, please login" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

app.get("/Final_Admin", (req, res) => {
  res.render("Final_Admin");
});



app.get("/Dashboard", verifyToken, async (req, res) => {
  try {
    // 🥙 Fetch menu for this restaurant
    const menuDoc = await Menu.findOne({ restaurant_id: req.userId });
    const totalItems = menuDoc ? menuDoc.menu.length : 0;
    const menuItems = menuDoc ? menuDoc.menu : [];

    // 📅 Fetch bookings for this restaurant
    const bookings = await BookingsModel.find({ restaurantId: req.userId }).populate("userId");

    // 📊 Calculate total bookings and total persons
    const totalBooking = bookings.length;
    const totalPersons = bookings.reduce((sum, booking) => sum + booking.membersCount, 0);

    // 📆 Calculate monthly bookings
    const monthlyBookings = {};
    bookings.forEach((booking) => {
      const [day, month, year] = booking.selectedDate.split("-");
      const yearShort = year; // e.g., '25'
      const monthKey = `${yearShort}-${month.padStart(2, "0")}`; // e.g., '25-03'

      if (!monthlyBookings[monthKey]) {
        monthlyBookings[monthKey] = {
          totalBookings: 0,
          totalPersons: 0,
        };
      }
      monthlyBookings[monthKey].totalBookings += 1;
      monthlyBookings[monthKey].totalPersons += booking.membersCount;
    });

    // ✅ Calculate today’s bookings
    const today = new Date();
    const todayString = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear().toString().slice(-2)}`;
    const todayBooking = bookings.filter((booking) => booking.selectedDate === todayString).length;
    const totalMonthlyBookings = Object.values(monthlyBookings).reduce((sum, month) => sum + month.totalBookings, 0);
    // 🌟 Render the dashboard
    res.render("dashadmin", {
      totalItems,
      menuItems,
      bookings,
      totalBooking,
      totalPersons,
      monthlyBookings,
      todayBooking,
      totalMonthlyBookings,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.redirect("/Final_Admin");
  }
});

app.get("/api/booking-count", verifyToken, async (req, res) => {
  try {
    const totalBooking = await BookingsModel.countDocuments({
      restaurantId: req.userId,
    });
    res.json({ totalBooking });
  } catch (error) {
    console.error("Error fetching booking count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Updated fooditem GET route
app.get("/fooditem", verifyToken, async (req, res) => {
  try {
    const menuDoc = await Menu.findOne({ restaurant_id: req.userId });
    const menuItems = menuDoc ? menuDoc.menu : [];
    res.render("fooditems", { menuItems });
  } catch (error) {
    console.error("Error fetching food items:", error.message);
    res.status(500).send(`Error fetching food items: ${error.message}`);
  }
});
app.use(fileUpload({ useTempFiles: true ,tempFileDir: '/tmp/'}));

app.post("/fooditem", verifyToken, async (req, res) => {
  try {
    // Ensure /tmp/ exists on Vercel
    const tempDir = '/tmp/';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const file = req.files.image;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath);

    const { name, description, price, category, foodType } = req.body;
    const imageUrl = result.secure_url; // Get image URL from Cloudinary
    const isVeg = foodType === "vegetarian";
    const newMenuItem = {
      name,
      description,
      price,
      category,
      imageUrl,
      isVeg
    };

    let menuDoc = await Menu.findOne({ restaurant_id: req.userId });

    if (!menuDoc) {
      menuDoc = new Menu({
        restaurant_id: req.userId,
        menu: [newMenuItem],
      });
    } else {
      menuDoc.menu.push(newMenuItem);
    }

    await menuDoc.save();
    res.redirect("/fooditem");
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ message: "Error adding food item" });
  }
});


app.get("/fooditem/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const menuDoc = await Menu.findOne({ "menu._id": id });

    if (!menuDoc) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const fooditem = menuDoc.menu.id(id);
    res.render("editFoodItem", { fooditem });
  } catch (error) {
    console.error("Error fetching food item:", error);
    res.status(500).json({ message: "Error fetching food item" });
  }
});

// Updated update route

// app.post("/fooditem/update", upload.single("image"), async (req, res) => {
//   try {
//     const { originalIndex, name, description, price, category, isVeg } =
//       req.body;

//     // Find the menu document containing this item
//     const menuDoc = await Menu.findOne({ "menu._id": originalIndex });

//     if (!menuDoc) {
//       return res.status(404).json({ message: "Food item not found" });
//     }

//     // Find the item in the menu array
//     const foodItem = menuDoc.menu.id(originalIndex);

//     // Update the item
//     foodItem.name = name;
//     foodItem.description = description;
//     foodItem.price = price;
//     foodItem.category = category;
//     foodItem.isVeg = isVeg === "on" || isVeg === true;

//     // Update image if provided
//     if (req.file) {
//       foodItem.imageUrl = `/images/${req.file.filename}`;
//     }

//     // Save the updated document
//     await menuDoc.save();

//     res.redirect("/Dashboard");
//   } catch (error) {
//     console.error("Error updating food item:", error);
//     res.status(500).json({ message: "Error updating food item" });
//   }
// });

// Updated delete route
app.post("/fooditem/update", verifyToken, async (req, res) => {
  try {
    const { originalIndex, name, description, price, category, isVeg } =
      req.body;

    // Find the menu document containing this item
    const menuDoc = await Menu.findOne({ "menu._id": originalIndex });

    if (!menuDoc) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Find the item in the menu array
    const foodItem = menuDoc.menu.id(originalIndex);

    // Update the item
    foodItem.name = name;
    foodItem.description = description;
    foodItem.price = price;
    foodItem.category = category;
    foodItem.isVeg = isVeg === "on" || isVeg === true;

    // Check if an image is uploaded
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath);
      foodItem.imageUrl = result.secure_url; // Update image URL
    }

    // Save the updated document
    await menuDoc.save();

    res.redirect("/fooditem");
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ message: "Error updating food item" });
  }
});

app.post("/fooditem/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the menu document containing this item
    const menuDoc = await Menu.findOne({ "menu._id": id });

    if (!menuDoc) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Remove the item from the menu array
    menuDoc.menu.pull(id);

    // Save the updated document
    await menuDoc.save();

    console.log(`Food item with ID ${id} deleted.`);
    res.redirect("/fooditem");
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.redirect("/Dashboard");
  }
});

app.get("/profile", verifyToken, async (req, res) => {
  try {
    // Fetch user details from MongoDB using userId from token
    const menuDoc = await Menu.findOne({ restaurant_id: req.userId });
    const totalItems = menuDoc ? menuDoc.menu.length : 0;
    const user = await RestroData.findById(req.userId);
    const location = user.location;
    const time = user.time;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // res.json(user);
    res.render("profile", { user, totalItems, location,time });
    // res.json({ user, totalItems, location });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile data" });
  }
});

// Updated total-items route
app.get("/total-items", verifyToken, async (req, res) => {
  try {
    const menuDoc = await Menu.findOne({ restaurant_id: req.userId });
    const totalItems = menuDoc ? menuDoc.menu.length : 0;
    res.json({ total: totalItems });
  } catch (error) {
    console.error("Error fetching total items:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Handle form submission and save to MongoDB
app.post("/Get_item", async (req, res) => {
  try {
    // console.log("Received Data:", req.body); // Log input data

    const newRestaurant = new RestroData(req.body);
    await newRestaurant.save();

    res.status(201).json({ message: "Restaurant Registered Successfully!" });
  } catch (error) {
    console.error("Error saving to database:", error);
    res.status(500).json({ message: "Error registering restaurant" });
  }
});

//edit profile
app.get("/profile/edit/:id", async (req, res) => {
  const user = await RestroData.findById(req.params.id);
  res.render("editProfile", {
    user,
  });
});

app.post("/profile/update", verifyToken, async (req, res) => {
  try {
    const { restaurantName, ownerName, phone, shopNo, floorNo, area, city, open, close, restrotype,email } = req.body;

    // Determine pureVeg based on the selected radio button
    const pureVeg = restrotype === "vegetarian";

    const updatedUser = await RestroData.findByIdAndUpdate(
      req.userId, // Get user ID from token
      {
        restaurantName,
        ownerName,
        phone,
        location: { shopNo, floorNo, area, city },
        time: { open, close },
        pureVeg,
        email
      },
      { new: true }
    );

    res.redirect("/profile"); // Redirect after update
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});


app.get("/menu/:id", async (req, res) => {
  try {
    let restroid = req.params.id;
    const restaurant = await RestroData.findOne({ _id: restroid });

    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    const menuDoc = await Menu.findOne({ restaurant_id: restroid });
    const menuItems = menuDoc ? menuDoc.menu : [];

    // res.render('homestyle-menu', { restaurant, menuItems });
    // console.log(menuItems);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).send("Server error");
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.get("/forget-password", async (req, res) => {
  res.render("forgetpass");
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await RestroData.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `https://webby-puce.vercel.app/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here to reset your password.</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
app.get('/check-email', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const existingRestaurant = await RestaurantModel.findOne({ email });
    if (existingRestaurant) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("Received request body:", req.body);

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await RestroData.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const user = await RestroData.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send("Invalid or expired token");
  }

  res.render("reset-password", { token });
});


app.use("/api", require("./Component/bookings.routes"));
const uploads = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    } else {
      return cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
    }
  },
});

app.post("/Dashboard/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting booking with ID:", id);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid ID:", id);
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Delete the booking
    const booking = await BookingsModel.findByIdAndDelete(id);

    if (!booking) {
      console.log("Booking not found with ID:", id);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log(`Booking with ID ${id} deleted.`);
    res.redirect("/Dashboard");
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.redirect("/Dashboard");
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
