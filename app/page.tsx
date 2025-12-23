'use client';
import { useState, useEffect } from 'react';

export default function YearProgress() {
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      setYear(currentYear);

      // Đặt mốc chính xác đầu năm và cuối năm
      const start = new Date(currentYear, 0, 1, 0, 0, 0); // 00:00:00 ngày 1/1
      const end = new Date(currentYear, 11, 31, 23, 59, 59); // 23:59:59 ngày 31/12
      
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      
      // Tính phần trăm và đảm bảo nó không vượt quá 100% hoặc nhỏ hơn 0%
      const percentage = (elapsed / total) * 100;
      setProgress(Math.max(0, Math.min(100, percentage))); 
    };

    calculateProgress();
    // Cập nhật mỗi giây (1000ms) để thấy con số nhảy theo thời gian thực cho sinh động
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Thay đổi 1: Năm đậm hơn
          - Đã đổi từ 'font-bold' sang 'font-black' (đậm nhất có thể)
        */}
        <h1 className="text-4xl font-black tracking-widest text-black uppercase">
          {year}
        </h1>

        {/* Thanh Progress Bar (Giữ nguyên) */}
        <div className="w-full h-8 border-2 border-black p-1">
          <div 
            className="h-full bg-black transition-all duration-[1000ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Thay đổi 2: Phần trăm không in nghiêng
          - Đã xóa class 'italic' đi
        */}
        <p className="text-xl font-bold text-black">
          {progress.toFixed(5)}%
        </p>
      </div>
    </main>
  );
}