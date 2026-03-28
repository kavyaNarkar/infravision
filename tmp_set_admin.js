const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = "mongodb+srv://infravisonAI:InfravisionAI%402026@cluster0.cwovzrd.mongodb.net/auth-db";
const TARGET_EMAIL = "admin@infra.com";
const TARGET_PASS = "pass@123";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected Successfully.");

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: { type: String },
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: false },
      provider: { type: String, default: 'local' }
    }, { timestamps: true }));

    let user = await User.findOne({ email: TARGET_EMAIL });

    if (user) {
      console.log(`User ${TARGET_EMAIL} found. Updating role to admin...`);
      user.role = 'admin';
      user.isVerified = true;
      
      // Update password just in case it doesn't match
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(TARGET_PASS, salt);
      
      await user.save();
      console.log("User updated to Admin!");
    } else {
      console.log(`User ${TARGET_EMAIL} not found. Creating new ADMIN account...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TARGET_PASS, salt);

      const newUser = new User({
        name: "Supreme Administrator",
        email: TARGET_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        provider: "local"
      });

      await newUser.save();
      console.log("New Admin User Created Successfully!");
    }

    process.exit(0);
  } catch (err) {
    console.error("Database connection/update failed:", err);
    process.exit(1);
  }
}

run();
