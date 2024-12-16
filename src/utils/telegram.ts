declare global {
    interface Window {
        Telegram: {
            WebApp: any;
        }
    }
}

export const initTelegramApp = () => {
    if (typeof window !== 'undefined' && window.Telegram) {
        const webapp = window.Telegram.WebApp;
        webapp.ready();
        webapp.expand();
        
        return webapp;
    }
    return null;
};

export const getTelegramUser = () => {
    if (typeof window !== 'undefined' && window.Telegram) {
        return window.Telegram.WebApp.initDataUnsafe?.user;
    }
    return null;
};
