import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Get the manager password from environment variable
    const managerPassword = process.env.MANAGER_PASSWORD;
    
    // Check if the password matches
    const success = password === managerPassword;
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error verifying manager password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify password" },
      { status: 500 }
    );
  }
} 