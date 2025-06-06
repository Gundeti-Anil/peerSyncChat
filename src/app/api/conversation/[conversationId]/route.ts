
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/utils/auth";
import getConversationById from "@/app/actions/getConversationById";


export async function DELETE(
  req: NextRequest,
) {
  try {
    const url = new URL(req.url);
    const conversationId = url.pathname.split('/').pop();
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    } 
    
    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversation = await getConversationById(conversationId);

    if (!conversation ) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const isUserInConversation = conversation.users.some(user => user.id === parseInt(currentUser.id));
    if (!isUserInConversation) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedConversation = await db.conversation.deleteMany({
      where: {
        id: conversationId,
        users: {
          some: {
            id: parseInt(currentUser.id),
          },
        },
      },
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.log("Error in Deleting Conversation", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}