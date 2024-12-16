export const TELEGRAM_BOT_TOKEN = '7928824207:AAHT7VlBfSetpY7uNwqgiEEoEW6vlFJYoGQ';
export const TELEGRAM_BOT_USERNAME = 'your_bot_username'; // Замените на username вашего бота

export const initTelegramApp = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined') {
    return (window as any).Telegram?.WebApp;
  }
  return null;
};

export const sendToTelegram = async (file: File) => {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    throw new Error('Telegram WebApp not initialized');
  }

  // Convert file to base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        
        // Send file to Telegram
        webApp.sendData(JSON.stringify({
          type: 'document',
          data: base64Data,
          filename: file.name
        }));
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};
