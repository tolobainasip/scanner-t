"use client";

import React, { useEffect } from 'react';
import { initTelegramApp } from '../config/telegram';

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initTelegramApp();
  }, []);

  return <>{children}</>;
};
