"use client";

import React, { useEffect } from 'react';
import { initTelegramApp } from '@/utils/telegram';

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-web-app.js';
        script.async = true;
        script.onload = () => {
            initTelegramApp();
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return <>{children}</>;
};
