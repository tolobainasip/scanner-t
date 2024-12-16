export const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Замените на ваш токен
export const TELEGRAM_BOT_USERNAME = 'YOUR_BOT_USERNAME'; // Замените на имя вашего бота

export const isTelegramWebApp = () => {
    return typeof window !== 'undefined' && window.Telegram?.WebApp;
};

export const getTelegramWebApp = () => {
    if (isTelegramWebApp()) {
        return window.Telegram.WebApp;
    }
    return null;
};
