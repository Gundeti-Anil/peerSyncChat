import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusher } from "@/lib/pusher";

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
  
//   const currentUser = session.user;

//   if (!currentUser || currentUser.role !== "MENTEE") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { searchParams } = new URL(req.url);
//   const targetUserId = searchParams.get("userId");

//   if (!targetUserId) {
//     return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//   }

//   const targetUser = await db.user.findUnique({
//     where: { id: parseInt(targetUserId) },
//   });

//   const hasSharedInterest =
//     targetUser?.role === "MENTEE" &&
//     currentUser.interestedIn?.some((interest: string) =>
//       targetUser.interestedIn.includes(interest)
//     );

//   if (!targetUser || !hasSharedInterest) {
//     return NextResponse.json(
//       { error: "Cannot fetch messages with this user" },
//       { status: 403 }
//     );
//   }
//   const conversation = await db.conversation.findFirst({
//     where: {
//       users: {
//         every: {
//           id: {
//             in: [parseInt(currentUser.id), parseInt(targetUserId)]
//           }
//         }
//       }
//     }
//   })

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
//     return NextResponse.json([], { status: 200 }); // No messages yet
//   }

//   return NextResponse.json(messages);
// }

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const currentUser = session.user;

 

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId") as string;
  
  if (!conversationId) {
    return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: {
      id: conversationId,
      users: {
        some: {
          id: parseInt(currentUser.id),
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const messages = await db.message.findMany({
    where: {
      conversationId: conversation.id
    },
    orderBy: { createdAt: "asc" },
  });

  if (!messages) {
    return NextResponse.json([], { status: 200 }); 
  }

  return NextResponse.json(messages);
}



export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;
  
    if (!currentUser || currentUser.role !== "MENTEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    
    const { body, image , conversationId} = await req.json();

  
    // if (!receiverId) {
    //   return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    // }
  
    // const targetUser = await db.user.findUnique({
    //   where: { id: parseInt(receiverId) },
    // });
  
    // const hasSharedInterest =
    //   targetUser?.role === "MENTEE" &&
    //   currentUser.interestedIn?.some((interest: string) =>
    //     targetUser.interestedIn.includes(interest)
    //   );
  
    // if (!targetUser || !hasSharedInterest) {
    //   return NextResponse.json(
    //     { error: "Cannot fetch messages with this user" },
    //     { status: 403 }
    //   );
    // }

    

    // if (image) {
    //   const imageResponse = await cloudinary.uploader.upload(image);
    //   message = imageResponse.secure_url;
    // }
    console.log(conversationId);
    const conversation = await db.conversation.findUnique({
      where: {
        id: conversationId,
        users: {
          some: {
            id: parseInt(currentUser.id),
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
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
            id: parseInt(currentUser.id),
          },
        },
        seen: {
          connect: {
            id: parseInt(currentUser.id),
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



    await pusher.trigger(`private-chat-${conversationId}`, "newMessage", newMessage);
  
    if (!newMessage) {
      return NextResponse.json([], { status: 200 }); 
    }
  
    return NextResponse.json(newMessage);
  }
  
