export const config = {
    // Конфигурация для Tesseract.js
    tesseract: {
        workerPath: 'https://unpkg.com/tesseract.js@v2.1.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://unpkg.com/tesseract.js-core@v2.1.0/tesseract-core.wasm.js',
        languages: ['rus', 'eng'],
    },
    
    // Конфигурация для OpenCV
    opencv: {
        wasmPath: 'https://docs.opencv.org/4.5.4/opencv.wasm',
    },
    
    // Настройки для обработки изображений
    imageProcessing: {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'image/jpeg',
    },
    
    // Настройки для PDF
    pdf: {
        defaultPageSize: { width: 595.28, height: 841.89 }, // A4
        margin: { top: 50, right: 50, bottom: 50, left: 50 },
    },
};
