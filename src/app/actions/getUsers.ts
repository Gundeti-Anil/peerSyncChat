import { db } from "@/lib/db";

import getSession from "./getSession";
import getCurrentUser from "./getCurrentUser";

const getUsers = async () => {
  const session = await getSession();

  if (!session?.user?.email) {
    return [];
  }

  try {

    const currentUser =await getCurrentUser();

    if(!currentUser){
      return null;
    }

    const interests = currentUser?.interestedIn;

    const sameInterestUsers = await db.user.findMany({
    where: {
      role: "MENTEE", 
      interestedIn: {
        hasSome: interests
      },
      NOT: { id: currentUser?.id },
    },
    select: { id: true, email: true, name: true,  },
  });

    if (!sameInterestUsers) {
      return [];
    }

    return sameInterestUsers;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getUsers;
