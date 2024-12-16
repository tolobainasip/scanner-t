declare module 'opencv.js' {
    interface Mat {
        delete(): void;
        rows: number;
        cols: number;
        data: Uint8Array;
        data32S: Int32Array;
    }

    interface MatVector {
        size(): number;
        get(index: number): Mat;
        delete(): void;
    }

    interface Size {
        width: number;
        height: number;
    }

    interface Point {
        x: number;
        y: number;
    }

    const enum ColorConversionCodes {
        COLOR_RGBA2GRAY = 11,
    }

    const enum ThresholdTypes {
        THRESH_BINARY = 0,
        ADAPTIVE_THRESH_GAUSSIAN_C = 1,
    }

    const enum RetrievalModes {
        RETR_EXTERNAL = 0,
    }

    const enum ContourApproximationModes {
        CHAIN_APPROX_SIMPLE = 1,
    }

    interface OpenCV {
        Mat: {
            new(): Mat;
            new(rows: number, cols: number, type: number): Mat;
        };
        MatVector: {
            new(): MatVector;
        };
        Size: {
            new(width: number, height: number): Size;
        };
        Point: {
            new(x: number, y: number): Point;
        };
        matFromImageData(imageData: ImageData): Mat;
        matFromArray(rows: number, cols: number, type: number, array: number[]): Mat;
        cvtColor(src: Mat, dst: Mat, code: ColorConversionCodes): void;
        GaussianBlur(src: Mat, dst: Mat, size: Size, sigmaX: number): void;
        adaptiveThreshold(src: Mat, dst: Mat, maxValue: number, adaptiveMethod: number, thresholdType: number, blockSize: number, C: number): void;
        findContours(image: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number): void;
        contourArea(contour: Mat): number;
        arcLength(curve: Mat, closed: boolean): number;
        approxPolyDP(curve: Mat, approxCurve: Mat, epsilon: number, closed: boolean): void;
        getPerspectiveTransform(src: Mat, dst: Mat): Mat;
        warpPerspective(src: Mat, dst: Mat, M: Mat, size: Size): void;

        COLOR_RGBA2GRAY: ColorConversionCodes;
        THRESH_BINARY: ThresholdTypes;
        ADAPTIVE_THRESH_GAUSSIAN_C: ThresholdTypes;
        RETR_EXTERNAL: RetrievalModes;
        CHAIN_APPROX_SIMPLE: ContourApproximationModes;
        CV_32FC2: number;
    }

    const cv: OpenCV;
    export default cv;
}
