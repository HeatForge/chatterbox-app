import { NextResponse } from "next/server";

import { getAllMessages } from "@/lib/services/messages";

export async function GET() {
  try {
    const messages = await getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("db-get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
