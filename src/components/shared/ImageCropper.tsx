'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Move, Check } from 'lucide-react';

interface ImageCropperProps {
  image: File;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  outputSize?: number;
}

export function ImageCropper({ 
  image, 
  onCrop, 
  onCancel, 
  aspectRatio = 1, 
  outputSize = 400 
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageData, setImageData] = useState<string>('');

  // Carregar imagem
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
    };
    reader.readAsDataURL(image);
  }, [image]);

  // Configurar canvas quando imagem carregar
  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      imageRef.current = img;
      
      // Definir tamanho do canvas (área de crop)
      const cropSize = 300;
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Calcular escala inicial para ajustar a imagem
      const initialScale = Math.max(
        cropSize / img.width,
        cropSize / img.height
      );
      
      setScale(initialScale);
      
      // Centralizar imagem
      setImagePosition({
        x: (cropSize - img.width * initialScale) / 2,
        y: (cropSize - img.height * initialScale) / 2
      });
      
      setImageLoaded(true);
    };

    img.src = imageData;
  }, [imageData]);

  // Desenhar no canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    ctx.drawImage(
      img,
      imagePosition.x,
      imagePosition.y,
      img.width * scale,
      img.height * scale
    );

    // Desenhar overlay escuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Criar área circular transparente
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, 2 * Math.PI);
    ctx.fill();

    // Voltar ao modo normal
    ctx.globalCompositeOperation = 'source-over';

    // Desenhar borda do círculo
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, 2 * Math.PI);
    ctx.stroke();
  }, [imagePosition, scale, imageLoaded]);

  // Redesenhar quando mudanças ocorrerem
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Eventos de mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Controles de zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev * 0.8, 0.1));
  };

  // Reset posição
  const handleReset = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const initialScale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );
    
    setScale(initialScale);
    setImagePosition({
      x: (canvas.width - img.width * initialScale) / 2,
      y: (canvas.height - img.height * initialScale) / 2
    });
  };

  // Gerar imagem cortada
  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const outputCanvas = document.createElement('canvas');
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) return;

    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    // Criar máscara circular
    outputCtx.beginPath();
    outputCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
    outputCtx.clip();

    // Calcular área de crop
    const cropRadius = canvas.width / 2 - 10;
    const cropX = canvas.width / 2 - cropRadius;
    const cropY = canvas.height / 2 - cropRadius;
    const cropSize = cropRadius * 2;

    // Desenhar imagem cortada
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    if (tempCtx) {
      tempCtx.drawImage(
        imageRef.current,
        imagePosition.x,
        imagePosition.y,
        imageRef.current.width * scale,
        imageRef.current.height * scale
      );

      outputCtx.drawImage(
        tempCanvas,
        cropX, cropY, cropSize, cropSize,
        0, 0, outputSize, outputSize
      );
    }

    const croppedImage = outputCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ajustar Foto</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Canvas para preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Resetar posição"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Instruções */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Move className="w-4 h-4" />
              <span>Arraste para mover</span>
            </div>
            <div className="flex items-center space-x-1">
              <ZoomIn className="w-4 h-4" />
              <span>Botões para zoom</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            disabled={!imageLoaded}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
}