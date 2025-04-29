import { NextResponse } from "next/server"
import mongoose from "mongoose"
import ExcelJS from "exceljs"

// Connect to MongoDB (reusing the same connection function)
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

// Get User model (must match the one in users route)
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      createdAt: Date,
    }),
  )

export async function GET() {
  try {
    await connectDB()

    // Fetch all users
    const users = await User.find({}).sort({ createdAt: -1 })

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Users")

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Date Added", key: "createdAt", width: 20 },
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true }

    // Add rows
    users.forEach((user) => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
      })
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Create response with Excel file
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=users.xlsx",
      },
    })

    return response
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json({ success: false, error: "Failed to export users" }, { status: 500 })
  }
}
