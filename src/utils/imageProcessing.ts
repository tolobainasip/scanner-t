import Tesseract from 'tesseract.js';

// Функция для инициализации захвата изображения
export const initializeImageCapture = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment'
            }
        });
        return stream;
    } catch (error) {
        console.error('Ошибка при доступе к камере:', error);
        throw error;
    }
};

// Функция для обработки изображения
export const processImage = async (imageData: ImageData): Promise<{
    processedImage: ImageData;
    text: string;
}> => {
    try {
        // Создаем canvas для обработки изображения
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Не удалось получить контекст canvas');
        }

        // Рисуем исходное изображение
        ctx.putImageData(imageData, 0, 0);

        // Базовая обработка изображения (увеличение контрастности)
        ctx.filter = 'contrast(1.2) brightness(1.1)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        // Получаем обработанное изображение
        const processedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Распознаем текст
        const { data: { text } } = await Tesseract.recognize(
            canvas.toDataURL('image/jpeg'),
            'rus+eng',
            {
                logger: (m) => console.log(m)
            }
        );

        return {
            processedImage: processedImageData,
            text
        };
    } catch (error) {
        console.error('Ошибка при обработке изображения:', error);
        throw error;
    }
};
