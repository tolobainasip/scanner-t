"use client";

import React, { useRef, useState, useEffect } from 'react';
import { sendToTelegram } from '../config/telegram';
import { processImage } from '../utils/imageProcessing';

export const Scanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isCamera, setIsCamera] = useState(true);
    const [recognizedText, setRecognizedText] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Определяем, является ли устройство мобильным
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        // Очищаем ресурсы при размонтировании компонента
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            // Останавливаем предыдущий стрим, если есть
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            // Запрашиваем доступ к камере
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: isMobile ? 'environment' : 'user',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });

            // Сохраняем стрим
            streamRef.current = stream;

            // Настраиваем видео элемент
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true'); // Важно для iOS
                
                // Ждем, пока видео будет готово
                await new Promise((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            if (videoRef.current) {
                                videoRef.current.play()
                                    .then(() => {
                                        // Устанавливаем стили только после успешного запуска
                                        videoRef.current.style.width = '100vw';
                                        videoRef.current.style.height = '100vh';
                                        videoRef.current.style.objectFit = 'cover';
                                        document.documentElement.style.overflow = 'hidden';
                                        setIsCameraOpen(true);
                                        setIsScanning(true);
                                        resolve(true);
                                    })
                                    .catch(error => {
                                        console.error('Error playing video:', error);
                                        alert('Ошибка при запуске камеры');
                                    });
                            }
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Ошибка при доступе к камере. Пожалуйста, убедитесь, что у приложения есть разрешение на использование камеры.');
        }
    };

    const stopCamera = () => {
        // Останавливаем все треки
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Очищаем видео элемент
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.style.width = '';
            videoRef.current.style.height = '';
            videoRef.current.style.objectFit = '';
        }

        // Восстанавливаем прокрутку
        document.documentElement.style.overflow = '';
        
        setIsCameraOpen(false);
        setIsScanning(false);
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Устанавливаем размеры canvas равными размерам видео
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Захватываем кадр
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setProcessedImage(imageData);
        
        // Обработка изображения и распознавание текста
        try {
            const result = await processImage(imageData);
            setProcessedImage(result.processedImage);
            setRecognizedText(result.text);
        } catch (error) {
            console.error('Ошибка при обработке изображения:', error);
        }
        
        stopCamera();
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4 ${isCameraOpen ? 'camera-fullscreen' : ''}`}>
            <div className={`max-w-md mx-auto space-y-6 ${isCameraOpen ? 'w-screen h-screen m-0 max-w-none' : ''}`}>
                {/* Header */}
                {!isCameraOpen && (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">Document Scanner</h1>
                        <p className="text-gray-600">Сканируйте документы и отправляйте в Telegram</p>
                    </div>
                )}

                {/* Camera View */}
                {isCameraOpen && (
                    <div className="fixed inset-0 z-50 bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {isScanning && (
                            <div className="scanner-line"></div>
                        )}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
                            <button
                                onClick={captureImage}
                                className="btn btn-primary rounded-full w-16 h-16 flex items-center justify-center"
                            >
                                <span className="sr-only">Capture</span>
                                <div className="w-12 h-12 rounded-full border-4 border-white"></div>
                            </button>
                            <button
                                onClick={stopCamera}
                                className="btn btn-secondary rounded-full px-6"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}

                {/* Controls and Results */}
                {!isCameraOpen && (
                    <>
                        <div className="controls-container">
                            <button
                                onClick={startCamera}
                                className="btn btn-primary"
                            >
                                Открыть камеру
                            </button>
                        </div>

                        {recognizedText && (
                            <div className="mt-6 p-4 bg-white rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-2">Распознанный текст:</h2>
                                <div className="prose max-w-none">
                                    {recognizedText.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Hidden canvas for image processing */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};
