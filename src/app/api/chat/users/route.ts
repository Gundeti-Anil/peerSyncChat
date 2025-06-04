import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // const currentUser = await db.user.findUnique({
  //   where: { email: session.user.email },
  // });
  
  const currentUser = session.user;

  if (!currentUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const interests = currentUser?.interestedIn;

  const sameInterestUsers = await db.user.findMany({
    where: {
      role: "MENTEE", 
      interestedIn: {
        hasSome: interests
      },
      NOT: { id: parseInt(currentUser?.id) },
    },
    select: { id: true, email: true, name: true,  },
  });

  return NextResponse.json(sameInterestUsers);
}
