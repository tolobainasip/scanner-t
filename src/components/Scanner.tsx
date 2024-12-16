"use client";

import React, { useEffect, useRef, useState } from 'react';
import { initializeImageCapture, processImage } from '@/utils/imageProcessing';
import { convertToPDF, convertToWord } from '@/utils/documentConversion';

export const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [showCamera, setShowCamera] = useState(true);

    useEffect(() => {
        loadCameras();
    }, []);

    const loadCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameras(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedCamera(videoDevices[0].deviceId);
                initCamera(videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Ошибка при получении списка камер:', error);
        }
    };

    const initCamera = async (deviceId: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: deviceId }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Ошибка при инициализации камеры:', error);
        }
    };

    const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = event.target.value;
        setSelectedCamera(deviceId);
        initCamera(deviceId);
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

    const toggleInput = (useCamera: boolean) => {
        setShowCamera(useCamera);
        if (!useCamera && fileInputRef.current) {
            fileInputRef.current.click();
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

    const sendToTelegram = async () => {
        if (!processedImage || !recognizedText || !canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const imageBlob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.8);
            });

            if (window.Telegram?.WebApp) {
                const file = new File([imageBlob], 'scanned-image.jpg', { type: 'image/jpeg' });
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

    // Вспомогательная функция для конвертации файла в base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xl">
                <div className="flex justify-center gap-4 mb-4">
                    <button
                        onClick={() => toggleInput(true)}
                        className={`px-4 py-2 rounded-lg ${showCamera ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Камера
                    </button>
                    <button
                        onClick={() => toggleInput(false)}
                        className={`px-4 py-2 rounded-lg ${!showCamera ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Галерея
                    </button>
                </div>

                {cameras.length > 1 && showCamera && (
                    <select
                        value={selectedCamera}
                        onChange={handleCameraChange}
                        className="w-full p-2 mb-4 border rounded-lg"
                    >
                        {cameras.map((camera) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || `Камера ${camera.deviceId.slice(0, 5)}`}
                            </option>
                        ))}
                    </select>
                )}

                <div className="relative w-full">
                    {showCamera && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-lg shadow-lg"
                        />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                {showCamera ? (
                    <button
                        onClick={captureImage}
                        disabled={isCapturing}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isCapturing ? 'Обработка...' : 'Сканировать'}
                    </button>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Выбрать файл
                    </button>
                )}

                {processedImage && (
                    <>
                        <button
                            onClick={sendToTelegram}
                            className="px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5]"
                        >
                            Отправить в Telegram
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
                    </>
                )}
            </div>

            {processedImage && (
                <div className="mt-4 w-full max-w-xl">
                    <h3 className="text-lg font-semibold mb-2">Распознанный текст:</h3>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="whitespace-pre-wrap">{recognizedText}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
