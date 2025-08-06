'use client';

// ============================================================================
// FILE UPLOAD - Componente de upload de arquivos
// ============================================================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Paperclip
} from 'lucide-react';
import type { Attachment } from '@/types';
import { useStandardAlert } from '@/components/shared/StandardAlert';

interface FileUploadProps {
  attachments: Attachment[];
  onUpload: (files: File[]) => Promise<Attachment[]>;
  onRemove: (attachmentId: string) => void;
  maxSize?: number; // em MB
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUpload({
  attachments,
  onUpload,
  onRemove,
  maxSize = 10,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert, AlertComponent } = useStandardAlert();

  const handleFiles = async (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Validações
    if (attachments.length + filesArray.length > maxFiles) {
      showAlert(
        'Limite de Arquivos',
        `Máximo de ${maxFiles} arquivos permitidos`,
        'warning'
      );
      return;
    }

    const invalidFiles = filesArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showAlert(
        'Arquivo Muito Grande',
        `Alguns arquivos excedem o tamanho máximo de ${maxSize}MB`,
        'warning'
      );
      return;
    }

    setIsUploading(true);
    
    try {
      await onUpload(filesArray);
    } catch {
      showAlert(
        'Erro no Upload',
        'Erro ao fazer upload dos arquivos',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openFile = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary">Fazendo upload...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-background rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-text-secondary" />
              </div>
              <div>
                <p className="text-text-primary font-medium">
                  Arraste arquivos aqui ou{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    clique para selecionar
                  </button>
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Máximo {maxFiles} arquivos, até {maxSize}MB cada
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-primary flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />
            Anexos ({attachments.length})
          </h4>
          
          <div className="space-y-2">
            <AnimatePresence>
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border-sentinela"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-text-secondary">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openFile(attachment)}
                      className="p-1.5 text-text-secondary hover:text-energia-alta transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = attachment.url;
                        a.download = attachment.name;
                        a.click();
                      }}
                      className="p-1.5 text-text-secondary hover:text-energia-alta transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(attachment.id)}
                      className="p-1.5 text-text-secondary hover:text-energia-critica transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <AlertComponent />
    </div>
  );
}

// Hook para simular upload de arquivos
export const useFileUpload = () => {
  const uploadFiles = async (files: File[]): Promise<Attachment[]> => {
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Em produção, seria a URL do servidor
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadedAt: new Date().toISOString(),
    }));
  };

  return { uploadFiles };
};
