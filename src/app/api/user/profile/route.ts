import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CustomSession } from "@/types";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    console.log("[USER_PROFILE_UPDATE] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;
    console.log("[USER_PROFILE_UPDATE] Request body:", { name, image });

    // Verifica se há alterações para fazer
    if (!name && !image) {
      return NextResponse.json({
        success: false,
        message: "No changes provided"
      }, { status: 400 });
    }

    // Atualiza o usuário
    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
    });

    console.log("[USER_PROFILE_UPDATE] Updated user:", JSON.stringify(user, null, 2));

    // Força a sessão a ser atualizada
    const newSession = {
      ...session,
      user: {
        ...session.user,
        name: user.name,
        image: user.image,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        image: user.image,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error("[USER_PROFILE_UPDATE] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal Error" 
      }), 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    console.log("[USER_PROFILE_DELETE] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Deleta o usuário
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error("[USER_PROFILE_DELETE] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal Error" 
      }), 
      { status: 500 }
    );
  }
}
