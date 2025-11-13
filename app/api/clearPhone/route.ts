import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { email },
      { $unset: { phone: "" } }
    );

    return NextResponse.json({ message: "Phone number cleared" }, { status: 200 });
  } catch (error) {
    console.error("Error clearing phone:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
