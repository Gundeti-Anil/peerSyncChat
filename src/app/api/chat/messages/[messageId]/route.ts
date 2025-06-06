import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/utils/auth";
import { revalidateTag } from "next/cache";

export async function DELETE(
  req: NextRequest,
) {
  try {
    const url = new URL(req.url);
    const messageId = url.pathname.split('/').pop();
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 

    const message = await db.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        conversation: true,
      },
    });
    
    if (!messageId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const deletedMessage = await db.message.deleteMany({
      where: {
        id: messageId,
      },
    });
    revalidateTag(`conversation-${message?.conversation.id}`);

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.log("Error in Deleting Conversation", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}