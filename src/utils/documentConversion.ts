import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Функция для конвертации в PDF
export const convertToPDF = async (
    processedImage: ImageData,
    text: string
): Promise<Uint8Array> => {
    try {
        // Создание нового PDF документа
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        // Конвертация ImageData в формат, подходящий для PDF
        const canvas = document.createElement('canvas');
        canvas.width = processedImage.width;
        canvas.height = processedImage.height;
        const ctx = canvas.getContext('2d');
        ctx?.putImageData(processedImage, 0, 0);
        
        // Конвертация canvas в base64
        const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
        const image = await pdfDoc.embedJpg(Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0)));

        // Добавление изображения на страницу
        const { width, height } = page.getSize();
        page.drawImage(image, {
            x: 50,
            y: height - 50 - processedImage.height,
            width: processedImage.width,
            height: processedImage.height,
        });

        // Добавление распознанного текста
        page.drawText(text, {
            x: 50,
            y: 50,
            size: 12,
            color: rgb(0, 0, 0),
        });

        // Сохранение документа
        return await pdfDoc.save();
    } catch (error) {
        console.error('Ошибка при конвертации в PDF:', error);
        throw error;
    }
};

// Функция для конвертации в Word
export const convertToWord = async (
    processedImage: ImageData,
    text: string
): Promise<Uint8Array> => {
    try {
        // Создание нового Word документа
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: text,
                                size: 24,
                            }),
                        ],
                    }),
                ],
            }],
        });

        // Конвертация canvas в изображение
        const canvas = document.createElement('canvas');
        canvas.width = processedImage.width;
        canvas.height = processedImage.height;
        const ctx = canvas.getContext('2d');
        ctx?.putImageData(processedImage, 0, 0);

        // Сохранение документа
        return await Packer.toBuffer(doc);
    } catch (error) {
        console.error('Ошибка при конвертации в Word:', error);
        throw error;
    }
};
