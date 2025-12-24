'use client';
import { useState, useEffect, useRef } from 'react';

// Thành phần hiệu ứng tuyết rơi
const SnowEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-80 animate-snow"
          style={{
            width: (Math.random() * 3 + 2) + 'px',
            height: (Math.random() * 3 + 2) + 'px',
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

export default function Home() {
  const [mode, setMode] = useState<'year' | 'focus'>('year');
  const [yearProgress, setYearProgress] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  // Focus Mode State
  const [inputMinutes, setInputMinutes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Logic tính % năm
  useEffect(() => {
    const updateYear = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      setYear(currentYear);
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31, 23, 59, 59);
      const percentage = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
      setYearProgress(percentage);
    };
    updateYear();
    const interval = setInterval(updateYear, 1000);
    return () => clearInterval(interval);
  }, []);

  // Logic Timer & Sound
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      osc.frequency.setValueAtTime(880, context.currentTime);
      osc.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.5);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || parseInt(val) >= 0) {
      setInputMinutes(val);
    }
  };

  const startFocus = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(inputMinutes);
    if (mins > 0) {
      setTotalFocusTime(mins * 60);
      setTimeLeft(mins * 60);
      setIsTimerRunning(true);
    }
  };

  const focusProgress = totalFocusTime > 0 ? ((totalFocusTime - timeLeft) / totalFocusTime) * 100 : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4 overflow-hidden relative font-sans">
      <div className="w-full max-w-md text-center flex flex-col items-center space-y-10">
        {mode === 'year' && (
          <div className="w-full space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black tracking-tighter text-black uppercase">{year}</h1>
            <div className="relative w-full h-10 border-[3px] border-black p-1 bg-white overflow-hidden shadow-[0_8px_20px_rgba(220,38,38,0.1)]">
              <div className="h-full bg-red-600 transition-all duration-1000 ease-linear" style={{ width: `${yearProgress}%` }} />
              <SnowEffect />
            </div>
            <p className="text-xl font-bold text-black tabular-nums">{yearProgress.toFixed(5)}%</p>
          </div>
        )}

        {mode === 'focus' && (
          <div className="w-full space-y-8 animate-in fade-in duration-500">
            {!isTimerRunning && timeLeft === 0 ? (
              <form onSubmit={startFocus} className="space-y-6">
                <h2 className="text-2xl font-bold text-black tracking-tight">How long do you want to focus?</h2>
                <div className="flex items-center justify-center space-x-3">
                  <input type="number" min="0" value={inputMinutes} onChange={handleInputChange} placeholder="0" className="w-20 text-center text-4xl font-black border-b-4 border-black focus:outline-none" autoFocus />
                  <span className="text-xl font-medium text-gray-400">minutes</span>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-3xl font-black uppercase tracking-widest">{inputMinutes} MINUTES</h2>
                <div className="relative w-full h-10 border-[3px] border-black p-1 bg-white overflow-hidden">
                  <div className="h-full bg-black transition-all duration-1000 ease-linear" style={{ width: `${focusProgress}%` }} />
                </div>
                <p className="text-xl font-bold text-black tabular-nums">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                <button onClick={() => { setIsTimerRunning(false); setTimeLeft(0); }} className="text-xs font-bold text-red-500 uppercase underline tracking-tighter">Reset</button>
              </>
            )}
          </div>
        )}

        <div className="pt-20">
          {/* TOÀN BỘ CLASS NẰM TRÊN 1 DÒNG ĐỂ TRÁNH LỖI BUILD */}
          <button 
            onClick={() => { setMode(mode === 'year' ? 'focus' : 'year'); setIsTimerRunning(false); setTimeLeft(0); }}
            className="bg-[#f2f2f2] text-[#888] px-6 py-2 rounded-xl font-semibold text-xs hover:bg-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-95"
          >
            {mode === 'year' ? 'Go to Focus' : 'Back to Year'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes snow {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(60px) translateX(20px); opacity: 0; }
        }
        .animate-snow { animation: snow linear infinite; }
      `}</style>
    </main>
  );
}