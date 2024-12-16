"use client";

import React, { useEffect, useRef, useState } from 'react';
import { initializeImageCapture, processImage } from '@/utils/imageProcessing';
import { convertToPDF, convertToWord } from '@/utils/documentConversion';

export const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [isCamera, setIsCamera] = useState(true);

    // Добавим определение мобильного устройства
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(videoDevices);
                
                // На мобильных устройствах предпочитаем заднюю камеру
                if (isMobile) {
                    const backCamera = videoDevices.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('задняя') ||
                        device.label.toLowerCase().includes('rear')
                    );
                    if (backCamera) {
                        setSelectedCamera(backCamera.deviceId);
                    }
                }
            } catch (error) {
                console.error('Error getting devices:', error);
            }
        };

        getDevices();
    }, []);

    const startCamera = async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                    facingMode: isMobile ? 'environment' : 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Ошибка при доступе к камере. Пожалуйста, убедитесь, что у приложения есть разрешение на использование камеры.');
        }
    };

    const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = event.target.value;
        setSelectedCamera(deviceId);
        startCamera();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !canvasRef.current) return;

        setIsCapturing(true);
        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const canvas = canvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const { processedImage: processed, text } = await processImage(imageData);
            setProcessedImage(processed);
            setRecognizedText(text);
        } catch (error) {
            console.error('Ошибка при обработке файла:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsCapturing(true);
        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const { processedImage: processed, text } = await processImage(imageData);
            setProcessedImage(processed);
            setRecognizedText(text);
        } catch (error) {
            console.error('Ошибка при захвате изображения:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const saveAsPDF = async () => {
        if (!processedImage || !recognizedText) return;

        try {
            const pdfBytes = await convertToPDF(processedImage, recognizedText);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            if (window.Telegram?.WebApp) {
                // Отправляем файл в Telegram
                const file = new File([blob], 'scanned-document.pdf', { type: 'application/pdf' });
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'pdf',
                    text: recognizedText,
                    file: await fileToBase64(file)
                }));
            } else {
                // Если не в Telegram, сохраняем локально
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scanned-document.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Ошибка при сохранении PDF:', error);
        }
    };

    const saveAsWord = async () => {
        if (!processedImage || !recognizedText) return;

        try {
            const docxBytes = await convertToWord(processedImage, recognizedText);
            const blob = new Blob([docxBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            
            if (window.Telegram?.WebApp) {
                // Отправляем файл в Telegram
                const file = new File([blob], 'scanned-document.docx', { 
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
                });
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'docx',
                    text: recognizedText,
                    file: await fileToBase64(file)
                }));
            } else {
                // Если не в Telegram, сохраняем локально
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scanned-document.docx';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Ошибка при сохранении Word:', error);
        }
    };

    const sendToTelegram = async (file: File) => {
        if (!processedImage || !recognizedText || !canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const imageBlob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.8);
            });

            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'image',
                    text: recognizedText,
                    file: await fileToBase64(file)
                }));
            }
        } catch (error) {
            console.error('Ошибка при отправке в Telegram:', error);
        }
    };

    const handleSendToTelegram = async () => {
        if (!processedImage) {
            alert('Сначала сделайте снимок!');
            return;
        }

        try {
            // Конвертируем base64 в File
            const response = await fetch(canvasRef.current?.toDataURL());
            const blob = await response.blob();
            const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });
            
            await sendToTelegram(file);
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            alert('Ошибка при отправке в Telegram');
        }
    };

    // Вспомогательная функция для конвертации файла в base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // Обновляем UI для лучшей поддержки мобильных устройств
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => setIsCamera(true)}
                        className={`px-4 py-2 rounded-lg ${isCamera ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Камера
                    </button>
                    <button
                        onClick={() => setIsCamera(false)}
                        className={`px-4 py-2 rounded-lg ${!isCamera ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Галерея
                    </button>
                </div>

                {isCamera && (
                    <>
                        <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={captureImage}
                                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            >
                                Сделать снимок
                            </button>
                        </div>
                    </>
                )}

                {!isCamera && (
                    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="fileInput"
                        />
                        <label
                            htmlFor="fileInput"
                            className="cursor-pointer px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
                        >
                            Выбрать файл
                        </label>
                    </div>
                )}

                {processedImage && (
                    <div className="mt-4">
                        <canvas
                            ref={canvasRef}
                            className="w-full rounded-lg shadow-lg"
                        />
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={handleSendToTelegram}
                                className="px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5]"
                            >
                                Отправить в Telegram
                            </button>
                            <button
                                onClick={() => setProcessedImage(null)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Отменить
                            </button>
                            <button
                                onClick={saveAsPDF}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                                Сохранить PDF
                            </button>
                            <button
                                onClick={saveAsWord}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                            >
                                Сохранить Word
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
