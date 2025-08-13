'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  AlertCircle,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useStandardAlert } from '@/components/shared/StandardAlert';
import { useCreateAttachment, useDeleteAttachment } from '@/hooks/api/useAttachments';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  isSaving?: boolean; // Estado de salvamento
  hasError?: boolean; // Estado de erro
}

interface AttachmentManagerProps {
  taskId?: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxSizePerFile?: number; // em bytes, padrão 50MB
}

export function AttachmentManager({ 
  taskId, 
  attachments, 
  onAttachmentsChange, 
  maxSizePerFile = 50 * 1024 * 1024 // 50MB
}: AttachmentManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>(attachments);
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useStandardAlert();

  // 🚀 React Query Hooks Otimistas
  const createAttachmentMutation = useCreateAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setCurrentAttachments(attachments);
  }, [attachments]);

  // Storage validation removed from frontend - handled by backend

  // 🚀 NOVA: Função para salvar anexo individual via API específica
  const saveAttachmentToTask = async (attachment: Attachment): Promise<void> => {
    if (!taskId || !user?.id) {
      console.error('Dados insuficientes:', { taskId, userId: user?.id });
      return;
    }
    
    try {
      // Usar endpoint específico para anexos com autenticação por cookies
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Para enviar cookies automaticamente
        body: JSON.stringify({
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size.toString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar anexo');
      }
      
      console.log('✅ Anexo salvo individualmente na tarefa');
    } catch (error) {
      console.error('❌ Erro ao salvar anexo:', error);
      throw error;
    }
  };

  // 🚀 NOVA: Função para remover anexo individual via API específica
  const removeAttachmentFromTask = async (attachmentId: string): Promise<void> => {
    if (!taskId || !user?.id) return;
    
    try {
      // Usar endpoint específico para remoção com autenticação por cookies
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        credentials: 'include' // Para enviar cookies automaticamente
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao remover anexo');
      }
      
      console.log('✅ Anexo removido individualmente da tarefa');
    } catch (error) {
      console.error('❌ Erro ao remover anexo:', error);
      throw error;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) 
      return <Archive className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const compressFile = async (file: File, quality: number = 0.8): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      // Para não-imagens, converter para base64 diretamente
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // Para imagens, comprimir
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 1024; // Máximo 1024px
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Verificar tamanho do arquivo individual
        if (file.size > maxSizePerFile) {
          showAlert(
            'Arquivo Muito Grande',
            `O arquivo "${file.name}" excede o limite de ${formatFileSize(maxSizePerFile)} por arquivo.`,
            'warning'
          );
          continue;
        }

        // NOTA: Validação de limite total removida do frontend
        // Motivo: O frontend só tem visibilidade dos anexos da tarefa atual,
        // mas o limite é por usuário (todos os anexos). A validação correta
        // está no backend (attachmentService.ts) que tem visão completa.

        setUploadProgress(((i + 1) / files.length) * 100);

        // Comprimir arquivo se necessário
        const compressedData = await compressFile(file, 0.8);
        
        // Garantir que type não seja vazio - definir um tipo padrão baseado na extensão
        let fileType = file.type;
        if (!fileType || fileType === '') {
          const extension = file.name.split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'md':
              fileType = 'text/markdown';
              break;
            case 'txt':
              fileType = 'text/plain';
              break;
            case 'pdf':
              fileType = 'application/pdf';
              break;
            case 'doc':
            case 'docx':
              fileType = 'application/msword';
              break;
            case 'jpg':
            case 'jpeg':
              fileType = 'image/jpeg';
              break;
            case 'png':
              fileType = 'image/png';
              break;
            case 'gif':
              fileType = 'image/gif';
              break;
            default:
              fileType = 'application/octet-stream';
          }
        }

        const attachment: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: fileType,
          url: compressedData,
          uploadedAt: new Date().toISOString(),
          isSaving: true, // Marcar como salvando
        };

        // TODO: Implementar endpoints de anexos no backend
        // Por enquanto, salvando apenas no estado local
        // if (taskId) {
        //   try {
        //     await saveAttachmentToBackend(attachment);
        //   } catch (error) {
        //     console.error('Erro ao salvar anexo:', error);
        //     showAlert(
        //       'Erro ao Salvar',
        //       `Erro ao salvar anexo "${file.name}". Tente novamente.`,
        //       'error'
        //     );
        //     continue;
        //   }
        // }

        newAttachments.push(attachment);
      }

      if (newAttachments.length > 0) {
        // 🚀 OTIMIZAÇÃO: Mostrar anexos imediatamente com estado "salvando"
        const updatedAttachments = [...currentAttachments, ...newAttachments];
        setCurrentAttachments(updatedAttachments);
        onAttachmentsChange(updatedAttachments);

        // 🚀 Salvar anexos usando React Query otimista
        if (taskId) {
          // Processar cada anexo individualmente com updates otimistas
          for (const attachment of newAttachments) {
            try {
              await createAttachmentMutation.mutateAsync({
                taskId,
                name: attachment.name,
                url: attachment.url,
                type: attachment.type,
                size: attachment.size.toString()
              });
              
              // ✅ Sucesso: Update otimista já foi aplicado pelo React Query
              console.log('✅ Anexo salvo com sucesso:', attachment.name);
              
              // Mostrar aviso de arquivo adicionado
              showAlert(
                'Arquivo Adicionado',
                `O arquivo "${attachment.name}" foi adicionado com sucesso.`,
                'success'
              );
              
            } catch (error) {
              console.error('❌ Erro ao salvar anexo individual:', error);
              
              // ❌ Erro: React Query já reverteu o update otimista
              showAlert(
                'Erro ao Salvar',
                `Erro ao salvar anexo "${attachment.name}". Tente novamente.`,
                'error'
              );
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error);
      showAlert(
        'Erro no Upload',
        'Erro ao fazer upload dos arquivos. Tente novamente.',
        'error'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachment = currentAttachments.find(att => att.id === attachmentId);
    if (!attachment) return;

    // Mostrar confirmação antes de excluir
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o arquivo "${attachment.name}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmed) {
      return;
    }

    if (!taskId) {
      // Sem taskId, apenas remover do estado local
      const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
      setCurrentAttachments(updatedAttachments);
      onAttachmentsChange(updatedAttachments);
      
      // Mostrar aviso de arquivo excluído
      showAlert(
        'Arquivo Excluído',
        `O arquivo "${attachment.name}" foi excluído com sucesso.`,
        'success'
      );
      return;
    }

    try {
      // 🚀 Usar React Query para remoção otimista
      await deleteAttachmentMutation.mutateAsync({ taskId, attachmentId });
      
      // ✅ Sucesso: Update otimista já foi aplicado pelo React Query
      console.log('✅ Anexo removido com sucesso');
      
      // Sincronizar estado local
      const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
      setCurrentAttachments(updatedAttachments);
      onAttachmentsChange(updatedAttachments);
      
      // Mostrar aviso de sucesso
      showAlert(
        'Arquivo Excluído',
        `O arquivo "${attachment.name}" foi excluído com sucesso.`,
        'success'
      );
      
    } catch (error) {
      console.error('❌ Erro ao remover anexo:', error);
      
      // ❌ Erro: React Query já reverteu o update otimista
      showAlert(
        'Erro ao Remover',
        'Erro ao remover anexo. Tente novamente.',
        'error'
      );
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Storage usage calculation removed - validation now handled by backend

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Anexos ({currentAttachments.length})
        </h3>
        
        <div className="text-xs text-gray-500">
          <span>Limite: 50MB por arquivo, 2GB total por usuário</span>
        </div>
      </div>

      {/* Botão de upload */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Adicionar Anexo
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

{/* Validação de limite removida - será feita no backend */}
      </div>

      {/* Barra de progresso durante upload */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Lista de anexos */}
      {currentAttachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">Nenhum anexo adicionado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`text-gray-600 ${attachment.isSaving ? 'opacity-50' : ''}`}>
                  {attachment.isSaving ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    getFileIcon(attachment.type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      attachment.hasError 
                        ? 'text-red-600' 
                        : attachment.isSaving 
                          ? 'text-gray-500' 
                          : 'text-gray-900'
                    }`}>
                      {attachment.name}
                    </p>
                    {attachment.isSaving && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Salvando...
                      </span>
                    )}
                    {attachment.hasError && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        Erro ao salvar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleDownload(attachment)}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  title="Download"
                  disabled={attachment.isSaving}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover"
                  disabled={attachment.isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AlertComponent />
    </div>
  );
}