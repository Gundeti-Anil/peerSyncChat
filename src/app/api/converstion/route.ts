import { NextResponse , NextRequest} from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { userId } = body;

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const currentUser = session.user;

    if (!currentUser || currentUser.role !== "MENTEE") {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingConversation = await db.conversation.findMany({
      where: {
        users: {
          every: {
            id: {
              in: [parseInt(currentUser.id), parseInt(userId)]
            }
          }
        }
      }
    });

    if (existingConversation.length > 0) {
      return NextResponse.json(existingConversation[0]);
    }

    const targetUser = await db.user.findUnique({
      where: { id: parseInt(userId) },
    });

    const hasSharedInterest =
    targetUser?.role === "MENTEE" &&
    currentUser.interestedIn?.some((interest: string) =>
      targetUser.interestedIn.includes(interest)
    );

    if (!targetUser || !hasSharedInterest) {
        return NextResponse.json(
          { error: "Cannot create conversation with this user" },
          { status: 403 }
        );
      }

    const newConversation = await db.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: parseInt(currentUser.id)
            },
            {
              id: parseInt(userId)
            }
          ]
        }
      },
      include: {
        users: false
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// export async function GET(
//   request: Request
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user?.email) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const currentUser = await prisma.user.findUnique({
//       where: {
//         email: session.user.email
//       }
//     });

//     if (!currentUser) {
//       return new NextResponse('Unauthorized', { status: 401 });
//     }

//     const conversations = await db.conversation.findMany({
//       orderBy: {
//         lastMessageAt: 'desc',
//       },
//       where: {
//         users: {
//           some: {
//             id: parseInt(currentUser.id)
//           }
//         }
//       },
//       include: {
//         users: true,
//         messages: {
//           include: {
//             sender: true,
//             seen: true,
//           }
//         },
//       }
//     });

//     return NextResponse.json(conversations);
//   } catch (error) {
//     console.log(error, 'ERROR_CONVERSATIONS');
//     return new NextResponse('Internal Error', { status: 500 });
//   }
// }