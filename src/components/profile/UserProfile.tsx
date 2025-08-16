'use client';

// ============================================================================
// USER PROFILE - Configurações de perfil do usuário
// ============================================================================

import React, { useState, useRef } from 'react';
import NextImage from 'next/image';
import { Save, Edit3, X, User, Mail, MapPin, Brain, Zap, Battery, Camera, Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { ImageCropper } from '../shared/ImageCropper';
import { useStandardAlert } from '../shared/StandardAlert';

export function UserProfile() {
  const { user, logout, refreshUser } = useAuth();
  const { showAlert, AlertComponent } = useStandardAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.settings.timezone || 'America/Sao_Paulo',
    dailyEnergyBudget: user?.settings.dailyEnergyBudget || 12,
  });

  const handleSave = async () => {
    if (user) {
      try {
        const updatedProfile = {
          name: formData.name,
          email: formData.email,
          timezone: formData.timezone,
          dailyEnergyBudget: formData.dailyEnergyBudget,
        };

        // Usar a API configurada do sistema
        const { userApi } = await import('@/lib/api');
        await userApi.updateProfile(updatedProfile);
        
        // Refresh user data from the server
        await refreshUser();
        
        // Forçar atualização da energia na sidebar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('energy-budget-updated'));
        }
        
        showAlert('Sucesso', 'Configurações salvas com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao salvar:', error);
        showAlert('Erro', 'Erro ao salvar configurações. Tente novamente.', 'error');
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.settings.timezone || 'America/Sao_Paulo',
      dailyEnergyBudget: user?.settings.dailyEnergyBudget || 12,
    });
    setIsEditing(false);
  };

  // Função para comprimir imagem
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para seleção inicial da foto
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      showAlert('Erro', 'Por favor, selecione apenas arquivos de imagem.', 'error');
      return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Erro', 'O arquivo deve ter no máximo 5MB.', 'error');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
  };

  // Função para processar imagem cortada
  const handleImageCropped = async (croppedImage: string) => {
    setIsUploadingPhoto(true);
    setShowCropper(false);

    try {      
      // Fazer upload da imagem cortada
      const { userApi } = await import('@/lib/api');
      await userApi.uploadAvatar(croppedImage);
      
      // Refresh user data to get updated avatar
      if (user) {
        await refreshUser();
      }
      
      showAlert('Sucesso', 'Foto de perfil atualizada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      showAlert('Erro', 'Erro ao fazer upload da foto. Tente novamente.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      setSelectedFile(null);
    }
  };

  // Função para cancelar crop
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    showAlert(
      'Sair do Sistema',
      'Tem certeza que deseja sair do sistema?',
      'warning',
      {
        showCancel: true,
        confirmText: 'Sair',
        onConfirm: async () => {
          await logout();
        }
      }
    );
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/New_York', label: 'Nova York (GMT-5)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' },
  ];

  return (
    <div className="space-y-6">

      {/* Header Mobile-First Design */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4">
          {/* Profile Info Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar Section - Mobile Optimized */}
            <div className="relative flex-shrink-0">
              <div 
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden cursor-pointer group transition-all duration-200 hover:ring-2 hover:ring-purple-400 touch-manipulation"
                onClick={handlePhotoClick}
              >
                {user?.avatar_url ? (
                  <NextImage
                    src={user.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 sm:w-8 sm:h-8 text-purple-600" />
                )}
                
                {/* Overlay com ícone de câmera */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                  {isUploadingPhoto ? (
                    <div className="w-6 h-6 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
              </div>
              
              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {/* Botão de upload visível - Mobile Touch Target */}
              <Button
                onClick={handlePhotoClick}
                size="icon"
                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-5 sm:h-5 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg min-h-[24px] min-w-[24px] touch-manipulation"
                title="Alterar foto"
              >
                <Upload className="w-3 h-3" />
              </Button>
            </div>
            
            {/* User Info - Mobile Centered */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {user?.name || 'Usuário'}
              </h1>
              <p className="text-purple-600 text-sm mt-1">
                🧠 Cérebro Compatível • Sistema Sentinela
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
              </p>
              <Button
                onClick={handlePhotoClick}
                variant="link"
                size="sm"
                className="text-xs text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1 p-0 h-auto mx-auto sm:mx-0 min-h-[32px] touch-manipulation"
              >
                <Camera className="w-3 h-3" />
                Alterar foto
              </Button>
            </div>
          </div>
          
          {/* Action Buttons - Mobile Stack */}
          <div className="pt-2 border-t border-gray-100">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base"
              >
                <Edit3 className="w-4 h-4 flex-shrink-0" />
                <span>Editar Perfil</span>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleSave}
                  variant="success"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-xl min-h-[44px] touch-manipulation text-sm sm:text-base"
                >
                  <Save className="w-4 h-4 flex-shrink-0" />
                  <span>Salvar</span>
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-xl min-h-[44px] touch-manipulation text-sm sm:text-base"
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>Cancelar</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configurações pessoais - Mobile Optimized */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 flex-shrink-0" />
          <span className="truncate">Configurações Pessoais</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Nome - Mobile First */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4 flex-shrink-0" />
              <span>Nome</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base min-h-[44px] touch-manipulation"
                placeholder="Seu nome"
              />
            ) : (
              <div className="bg-gray-50 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl text-gray-900 font-medium text-sm sm:text-base min-h-[44px] flex items-center">
                {user?.name || 'Usuário'}
              </div>
            )}
          </div>

          {/* Email - Mobile First */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base min-h-[44px] touch-manipulation"
                placeholder="seu@email.com"
              />
            ) : (
              <div className="bg-gray-50 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl text-gray-900 text-sm sm:text-base min-h-[44px] flex items-center break-all">
                {user?.email}
              </div>
            )}
          </div>

          {/* Timezone - Mobile First */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Fuso Horário</span>
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-50 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl text-gray-900 text-sm sm:text-base min-h-[44px] flex items-center">
                {timezones.find(tz => tz.value === user?.settings.timezone)?.label || 'Brasília (GMT-3)'}
              </div>
            )}
          </div>

          {/* Orçamento de Energia - Mobile First */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Orçamento Diário de Energia</span>
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      value={formData.dailyEnergyBudget}
                      onChange={(e) => setFormData({ ...formData, dailyEnergyBudget: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-base sm:text-lg font-medium min-h-[44px] touch-manipulation"
                      placeholder="Digite o orçamento"
                    />
                  </div>
                  <div className="text-center sm:text-left text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                    pontos de energia
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Defina quantos pontos de energia você tem disponível por dia
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 px-3 sm:px-4 py-3 rounded-lg sm:rounded-xl text-gray-900 flex items-center justify-between text-sm sm:text-base min-h-[44px]">
                <span>{user?.settings.dailyEnergyBudget} pontos de energia</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && <Zap className="w-4 h-4 text-red-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && <Brain className="w-4 h-4 text-blue-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && <Battery className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Logout - Mobile Optimized */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 flex-shrink-0" />
          <span>Sessão</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Sair do Sistema</h3>
            <p className="text-gray-500 text-sm mt-1">
              Encerra sua sessão atual e retorna à tela de login
            </p>
          </div>
          
          <Button
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation text-sm sm:text-base flex-shrink-0"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-semibold">Logout</span>
          </Button>
        </div>
      </div>

      {/* Modal de crop da imagem */}
      {showCropper && selectedFile && (
        <ImageCropper
          image={selectedFile}
          onCrop={handleImageCropped}
          onCancel={handleCropCancel}
          aspectRatio={1}
          outputSize={400}
        />
      )}
      
      <AlertComponent />
    </div>
  );
}
