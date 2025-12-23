'use client';
import { useState, useEffect } from 'react';

// Thành phần tạo các hạt tuyết rơi
const SnowEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-90 shadow-[0_0_5px_white] animate-snow"
          style={{
            width: (Math.random() * 4 + 2) + 'px',
            height: (Math.random() * 4 + 2) + 'px',
            left: (Math.random() * 100) + '%',
            top: '-10px',
            animationDuration: (Math.random() * 3 + 2) + 's',
            animationDelay: (Math.random() * 2) + 's',
          }}
        />
      ))}
    </div>
  );
};

export default function YearProgress() {
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      setYear(currentYear);

      const start = new Date(currentYear, 0, 1, 0, 0, 0);
      const end = new Date(currentYear, 11, 31, 23, 59, 59);
      
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      
      const percentage = (elapsed / total) * 100;
      setProgress(Math.max(0, Math.min(100, percentage)));
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Năm hiện tại */}
        <h1 className="text-5xl font-black tracking-tighter text-black uppercase">
          {year}
        </h1>

        {/* Thanh Progress Bar Noel Style */}
        <div className="relative w-full h-12 border-[4px] border-black p-1 bg-white overflow-hidden shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
          {/* Phần đã chạy qua: Màu đỏ */}
          <div 
            className="h-full bg-red-600 transition-all duration-1000 ease-linear relative"
            style={{ width: `${progress}%` }}
          />
          
          {/* Hiệu ứng tuyết rơi */}
          <SnowEffect />
        </div>

        {/* Phần trăm */}
        <p className="text-2xl font-bold text-black tabular-nums">
          {progress.toFixed(5)}%
        </p>
      </div>

      {/* Hiệu ứng animation tuyết rơi */}
      <style jsx global>{`
        @keyframes snow {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(60px) translateX(20px); opacity: 0; }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}</style>
    </main>
  );
}