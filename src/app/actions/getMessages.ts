import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";


export const getMessages= async (conversationId: string) => {

    if (!conversationId) return [];
  
    const getCachedMessages = unstable_cache(
      async () => {
        try {
          const messages = await db.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
          });
          return messages;
        } catch (error) {
          console.log(error);
          return [];
        }
      },
      [`messages-${conversationId}`], 
      {
        tags: [`conversation-${conversationId}`, 'messages'],
        revalidate: 300,
      }
    );
  
    return getCachedMessages();
  };

// const getMessages = unstable_cache(async (conversationId: string) => {
//   try {
//     const messages = await db.message.findMany({
//         where: {
//           conversationId: conversationId
//         },
//         orderBy: { createdAt: "asc" },
//       });

//     return messages;
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// },   {
//   tags: ['messages'],
//   revalidate: 300, // 5 minutes
// })

export default getMessages;























































































// const conversation = await db.conversation.findFirst({
    //     where: {
    //       users: {
    //         every: {
    //           id: {
    //             in: [currentUserId, userId]
    //           }
    //         }
    //       }
    //     },
    //     include: {
    //       messages: {
    //         orderBy: { createdAt: "desc" },
    //         select: {
    //           id: true,
    //           body: true,
    //           image: true,
    //           createdAt: true,
    //           senderId: true,
    //           seen: {
    //             select: {
    //               id: true,
    //               name: true,
    //               image: true,
    //             }
    //           }
    //         }
    //       }
    //     }
    //   },
    // );