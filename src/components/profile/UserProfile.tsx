'use client';

// ============================================================================
// USER PROFILE - Configurações de perfil do usuário
// ============================================================================

import React, { useState, useRef } from 'react';
import NextImage from 'next/image';
import { Save, Edit3, X, User, Mail, MapPin, Brain, Zap, Battery, Camera, Upload, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../../stores/authStore';
import { ImageCropper } from '../shared/ImageCropper';
import { useStandardAlert } from '../shared/StandardAlert';

export function UserProfile() {
  const { user, setUser, clearAuth } = useAuthStore();
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

        // Chamar API para salvar no backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('auth-token');
        
        const response = await fetch(`${apiUrl}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify(updatedProfile),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Atualizar store local com dados do servidor
          setUser(data.data);
          
          // Forçar atualização da energia na sidebar
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('energy-budget-updated'));
          }
          
          showAlert('Sucesso', 'Configurações salvas com sucesso!', 'success');
        } else {
          throw new Error('Erro ao salvar configurações');
        }
      } catch (error) {
        console.error('Erro ao salvar:', error);
        showAlert('Erro', 'Erro ao salvar configurações. Salvando localmente.', 'error');
        
        // Fallback: salvar localmente
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          settings: {
            ...user.settings,
            timezone: formData.timezone,
            dailyEnergyBudget: formData.dailyEnergyBudget,
          },
          updatedAt: new Date().toISOString(),
        });
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
      // Salvar no localStorage/authStore
      if (user) {
        setUser({
          ...user,
          avatar_url: croppedImage,
          updatedAt: new Date().toISOString(),
        });
      }
      
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
        onConfirm: () => {
          clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
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

      {/* Header com informações principais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 sm:mb-0">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden cursor-pointer group transition-all duration-200 hover:ring-2 hover:ring-purple-400"
                onClick={handlePhotoClick}
              >
                {user?.avatar_url ? (
                  <NextImage
                    src={user.avatar_url}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 text-purple-600" />
                )}
                
                {/* Overlay com ícone de câmera */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                  {isUploadingPhoto ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
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
              
              {/* Botão de upload visível */}
              <Button
                onClick={handlePhotoClick}
                size="icon"
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                title="Alterar foto"
              >
                <Upload className="w-3 h-3" />
              </Button>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name || 'Usuário'}</h1>
              <p className="text-purple-600 text-sm mt-1">🧠 Cérebro Compatível • Sistema Sentinela</p>
              <p className="text-gray-500 text-xs mt-1">
                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
              </p>
              <Button
                onClick={handlePhotoClick}
                variant="link"
                size="sm"
                className="text-xs text-purple-600 hover:text-purple-700 mt-1 flex items-center gap-1 p-0 h-auto"
              >
                <Camera className="w-3 h-3" />
                Alterar foto
              </Button>
            </div>
          </div>
          
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                variant="success"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="secondary"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Configurações pessoais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Configurações Pessoais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Nome</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Seu nome"
              />
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 font-medium">
                {user?.name || 'Usuário'}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="seu@email.com"
              />
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900">
                {user?.email}
              </div>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>Fuso Horário</span>
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900">
                {timezones.find(tz => tz.value === user?.settings.timezone)?.label || 'Brasília (GMT-3)'}
              </div>
            )}
          </div>

          {/* Orçamento de Energia */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Zap className="w-4 h-4" />
              <span>Orçamento Diário de Energia</span>
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      value={formData.dailyEnergyBudget}
                      onChange={(e) => setFormData({ ...formData, dailyEnergyBudget: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-medium"
                      placeholder="Digite o orçamento"
                    />
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    pontos de energia
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Defina quantos pontos de energia você tem disponível por dia
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-xl text-gray-900 flex items-center justify-between">
                <span>{user?.settings.dailyEnergyBudget} pontos de energia</span>
                <div className="flex items-center space-x-1">
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 15 && <Zap className="w-4 h-4 text-red-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget >= 10 && user.settings.dailyEnergyBudget < 15 && <Brain className="w-4 h-4 text-blue-500" />}
                  {user?.settings.dailyEnergyBudget && user.settings.dailyEnergyBudget < 10 && <Battery className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de Logout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <LogOut className="w-5 h-5 mr-2 text-red-600" />
          Sessão
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Sair do Sistema</h3>
            <p className="text-gray-500 text-sm mt-1">
              Encerra sua sessão atual e retorna à tela de login
            </p>
          </div>
          
          <Button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
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
