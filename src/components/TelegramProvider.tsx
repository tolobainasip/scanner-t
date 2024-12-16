"use client";

import React, { useEffect } from 'react';
import { initTelegramApp } from '@/config/telegram';

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Инициализируем Telegram Web App
    initTelegramApp();
  }, []);

  return <>{children}</>;
};
