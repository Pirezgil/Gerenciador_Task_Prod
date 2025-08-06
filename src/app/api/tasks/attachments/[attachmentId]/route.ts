import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { attachmentId: string } }
) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { attachmentId } = params;

    // Verificar se o anexo existe e pertence a uma tarefa do usuário
    const attachment = await prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        task: {
          userId: user.id
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 });
    }

    // Remover anexo
    await prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro ao remover anexo:', error);
    
    if (error.message?.includes('Token') || error.message?.includes('autorização')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}