"use client";

import React, { useRef, useState } from 'react';
import { sendToTelegram } from '../config/telegram';

export const Scanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isCamera, setIsCamera] = useState(true);

    // Определяем, является ли устройство мобильным
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const startCamera = async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
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
            setIsCameraOpen(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Ошибка при доступе к камере. Пожалуйста, убедитесь, что у приложения есть разрешение на использование камеры.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setProcessedImage(imageData);
            };
        } catch (error) {
            console.error('Error processing file:', error);
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setProcessedImage(imageData);
        stopCamera();
    };

    const handleSendToTelegram = async () => {
        if (!processedImage || !canvasRef.current) {
            alert('Сначала сделайте снимок!');
            return;
        }

        try {
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' });
            
            await sendToTelegram(file);
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            alert('Ошибка при отправке в Telegram');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Document Scanner</h1>
                    <p className="text-gray-600">Сканируйте документы и отправляйте в Telegram</p>
                </div>

                {/* Mode Switcher */}
                <div className="glass-morphism rounded-full p-1 flex justify-between">
                    <button
                        onClick={() => {
                            setIsCamera(true);
                            stopCamera();
                        }}
                        className={`flex-1 btn ${isCamera ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                            Камера
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setIsCamera(false);
                            stopCamera();
                        }}
                        className={`flex-1 btn ${!isCamera ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Галерея
                        </span>
                    </button>
                </div>

                {/* Main Content */}
                {isCamera && !isCameraOpen && (
                    <div className="flex justify-center">
                        <button
                            onClick={startCamera}
                            className="btn btn-primary"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Открыть камеру
                            </span>
                        </button>
                    </div>
                )}

                {isCamera && isCameraOpen && (
                    <div className="camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[90%] h-[80%] border-2 border-white/50 rounded-lg"></div>
                        </div>
                    </div>
                )}

                {!isCamera && (
                    <div className="file-drop-zone">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="fileInput"
                        />
                        <label
                            htmlFor="fileInput"
                            className="flex flex-col items-center justify-center cursor-pointer"
                        >
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-gray-600">Нажмите или перетащите файл сюда</span>
                        </label>
                    </div>
                )}

                {/* Preview */}
                {processedImage && (
                    <div className="mt-6 space-y-4">
                        <canvas
                            ref={canvasRef}
                            className="w-full rounded-2xl shadow-xl"
                        />
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={handleSendToTelegram}
                                className="btn btn-accent"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Отправить в Telegram
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setProcessedImage(null);
                                    setIsCameraOpen(false);
                                }}
                                className="btn btn-danger"
                            >
                                Отменить
                            </button>
                        </div>
                    </div>
                )}

                {/* Camera Controls */}
                {isCamera && isCameraOpen && !processedImage && (
                    <div className="controls-container">
                        <button
                            onClick={captureImage}
                            className="btn btn-primary"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                                Сделать снимок
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
