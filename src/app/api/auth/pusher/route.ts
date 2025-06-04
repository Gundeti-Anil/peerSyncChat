import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

interface PusherAuthBody {
    socket_id: string;
    channel_name: string;
}

export async function POST(
	req: NextRequest,
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
    
    const body = (await req.json()) as PusherAuthBody;

    const { socket_id, channel_name } = body;
	const data = {
		user_id: session.user.email,
	};

	const authResponse = pusher.authorizeChannel(socket_id, channel_name, data);
	return NextResponse.json(authResponse);
}