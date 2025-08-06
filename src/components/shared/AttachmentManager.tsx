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
import { useAuthStore } from '@/stores/authStore';
import { useStandardAlert } from '@/components/shared/StandardAlert';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
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
  const { user } = useAuthStore();
  const { showAlert, AlertComponent } = useStandardAlert();

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setCurrentAttachments(attachments);
  }, [attachments]);

  // Limite de 2GB por usuário
  const USER_STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB em bytes

  // Calcular tamanho total dos anexos do usuário
  const getUserStorageUsed = (): number => {
    return currentAttachments.reduce((total, att) => total + att.size, 0);
  };

  // Função para obter token de autenticação
  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  };

  // Função para salvar anexo no backend
  const saveAttachmentToBackend = async (attachment: Attachment): Promise<void> => {
    if (!taskId || !user?.id) {
      console.error('Dados insuficientes:', { taskId, userId: user?.id });
      return;
    }
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const payload = {
      taskId,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size
    };
    
    console.log('Enviando dados para API:', payload);
    
    try {
      const response = await fetch('/api/tasks/attachments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || 'Erro ao salvar anexo');
      }
      
      const result = await response.json();
      console.log('Anexo salvo com sucesso:', result);
    } catch (error) {
      console.error('Erro ao salvar anexo no backend:', error);
      throw error;
    }
  };

  // Função para remover anexo do backend
  const removeAttachmentFromBackend = async (attachmentId: string): Promise<void> => {
    if (!taskId || !user?.id) return;
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    try {
      const response = await fetch(`/api/tasks/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao remover anexo');
      }
      
      console.log('Anexo removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover anexo do backend:', error);
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
      const currentStorageUsed = getUserStorageUsed();

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

        // Verificar se não excede o limite total do usuário
        const totalNewSize = newAttachments.reduce((sum, att) => sum + att.size, 0);
        if (currentStorageUsed + totalNewSize + file.size > USER_STORAGE_LIMIT) {
          showAlert(
            'Limite de Armazenamento',
            `O arquivo "${file.name}" excederia o limite de armazenamento de 2GB por usuário.`,
            'warning'
          );
          break;
        }

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
        };

        // Salvar no backend se taskId estiver disponível
        if (taskId) {
          try {
            await saveAttachmentToBackend(attachment);
          } catch (error) {
            console.error('Erro ao salvar anexo:', error);
            showAlert(
              'Erro ao Salvar',
              `Erro ao salvar anexo "${file.name}". Tente novamente.`,
              'error'
            );
            continue;
          }
        }

        newAttachments.push(attachment);
      }

      if (newAttachments.length > 0) {
        const updatedAttachments = [...currentAttachments, ...newAttachments];
        setCurrentAttachments(updatedAttachments);
        onAttachmentsChange(updatedAttachments);
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
    try {
      // Remover do backend se taskId estiver disponível
      if (taskId) {
        await removeAttachmentFromBackend(attachmentId);
      }
      
      const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
      setCurrentAttachments(updatedAttachments);
      onAttachmentsChange(updatedAttachments);
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
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

  const storageUsed = getUserStorageUsed();
  const storagePercentage = (storageUsed / USER_STORAGE_LIMIT) * 100;

  return (
    <div className="space-y-4">
      {/* Cabeçalho com informações de armazenamento */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Anexos ({currentAttachments.length})
        </h3>
        
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>{formatFileSize(storageUsed)} / 2GB usados</span>
            {storagePercentage > 80 && (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
            <div 
              className={`h-full rounded-full transition-all ${
                storagePercentage > 90 ? 'bg-red-500' : 
                storagePercentage > 80 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Botão de upload */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || storagePercentage >= 100}
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

        {storagePercentage >= 100 && (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Limite de armazenamento atingido
          </span>
        )}
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
                <div className="text-gray-600">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
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
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover"
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