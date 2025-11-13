import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json();

    // --- Basic validation ---
    if (!email) {
      return NextResponse.json(
        { message: "User email is required." },
        { status: 400 }
      );
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { message: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // --- Connect to MongoDB ---
    const client = await clientPromise;
    const db = client.db();

    // --- Save or update user's phone number ---
    const result = await db.collection("users").updateOne(
      { email },
      { $set: { phone } },
      { upsert: true }
    );

    return NextResponse.json(
      {
        message:
          result.modifiedCount > 0
            ? "Phone number updated successfully!"
            : "Phone number saved successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving phone:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
