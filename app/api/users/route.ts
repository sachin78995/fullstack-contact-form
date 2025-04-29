import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string)
      console.log("MongoDB connected")
    }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Initialize the User model
const User = mongoose.models.User || mongoose.model("User", userSchema)

// GET handler to fetch all users
export async function GET() {
  try {
    await connectDB()
    const users = await User.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: users }, { status: 200 })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST handler to create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    // Validate input
    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, error: "Please provide all required fields" }, { status: 400 })
    }

    await connectDB()

    // Check if user with email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = await User.create({ name, email, phone })
    return NextResponse.json({ success: true, data: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
