import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface IParams {
  conversationId?: string;
}

export async function POST({ params }: { params: IParams }) {
  try {
    const session = await getServerSession(authOptions);
    const { conversationId } = params;

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = session.user;

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    const updatedMessage = await db.message.update({
      where: {
        id: lastMessage.id,
      },
      data: {
        seen: {
          connect: {
            id: parseInt(currentUser.id),
          },
        },
      },
      include: {
        seen: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
    });


    // if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
    //   return NextResponse.json(conversation);
    // }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log("Seen converstion error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
