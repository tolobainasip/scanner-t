export const TELEGRAM_BOT_TOKEN = '7928824207:AAHT7VlBfSetpY7uNwqgiEEoEW6vlFJYoGQ';
export const TELEGRAM_BOT_USERNAME = 'ScannerTBot'; // Замените на username вашего бота

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
    throw new Error('Telegram WebApp is not initialized');
  }

  try {
    // Конвертируем файл в base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
    });

    // Отправляем данные в Telegram
    webApp.sendData(JSON.stringify({
      type: 'image',
      file: base64,
      filename: file.name
    }));

  } catch (error) {
    console.error('Error sending to Telegram:', error);
    throw error;
  }
};
