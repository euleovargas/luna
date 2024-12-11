import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
