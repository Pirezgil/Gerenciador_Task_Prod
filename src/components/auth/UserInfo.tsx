'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserInfoProps {
  showLogout?: boolean;
  showSettings?: boolean;
  className?: string;
}

export function UserInfo({ 
  showLogout = false, 
  showSettings = false, 
  className = '' 
}: UserInfoProps) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user.email}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        {showSettings && (
          <Button
            size="sm"
            variant="ghost"
            className="p-2"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
        
        {showLogout && (
          <Button
            size="sm"
            variant="ghost"
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}