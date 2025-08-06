import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    console.log('Dados recebidos na API:', body);
    
    const { taskId, name, url, type, size } = body;

    if (!taskId || !name || !url || !type || size === undefined) {
      console.error('Dados obrigatórios faltando:', { taskId, name, url, type, size });
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    // Verificar se a tarefa pertence ao usuário
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id }
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    // Criar anexo
    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        name,
        url,
        type,
        size: BigInt(size)
      }
    });

    return NextResponse.json({
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size.toString(),
      uploadedAt: attachment.uploadedAt.toISOString()
    });

  } catch (error: any) {
    console.error('Erro ao criar anexo:', error);
    
    if (error.message?.includes('Token') || error.message?.includes('autorização')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}