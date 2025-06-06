import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getMessages from "@/app/actions/getMessages";
import getConversationByUserId from "@/app/actions/getConversationByUserId";
import { revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  

  if (!currentUser || currentUser.role !== "MENTEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const conversation = await getConversationByUserId(currentUser.id, parseInt(targetUserId));

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const messages = await getMessages(conversation?.id as string);
  
  if (!messages) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  
  return NextResponse.json(messages);


}




export async function POST(req: NextRequest) {
    const currentUser = await getCurrentUser();
  
    if (!currentUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    if (!currentUser || currentUser.role !== "MENTEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
       
    const { body, image , conversationId } = await req.json();

    // if (image) {
    //   const imageResponse = await cloudinary.uploader.upload(image);
    //   message = imageResponse.secure_url;
    // }
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        // users: {
        //   some: {
        //     id: parseInt(currentUser.id),
        //   },
        // },
      },
      include: {
        users: true,
      },
    });


    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    const isUserInConversation = conversation?.users.some(user => user.id === currentUser.id);
    if (!isUserInConversation) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const newMessage = await db.message.create({
      data: {
        body: body,
        image,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        seen: {
          select: {
            id: true
          }
        }
      },
    });

    await pusherServer.trigger(`private-chat-${conversationId}`, "newMessage", newMessage);

    revalidateTag(`conversation-${conversationId}`);

    await db.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });

   
  
    if (!newMessage) {
      return NextResponse.json([], { status: 200 }); 
    }
  
    return NextResponse.json(newMessage);
  }
  


























































  // export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
  
//   const currentUser = session.user;

 

//   const { searchParams } = new URL(req.url);
//   const conversationId = searchParams.get("conversationId") as string;
  
//   if (!conversationId) {
//     return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
//   }

//   const conversation = await db.conversation.findUnique({
//     where: {
//       id: conversationId,
//       users: {
//         some: {
//           id: parseInt(currentUser.id),
//         },
//       },
//     },
//   });

//   if (!conversation) {
//     return NextResponse.json(
//       { error: "Conversation not found" },
//       { status: 404 }
//     );
//   }

//   const messages = await db.message.findMany({
//     where: {
//       conversationId: conversation.id
//     },
//     orderBy: { createdAt: "asc" },
//   });

//   if (!messages) {
//     return NextResponse.json([], { status: 200 }); 
//   }

//   return NextResponse.json(messages);
// }
