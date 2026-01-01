'use client';
import { useState, useEffect, useRef } from 'react';
import { getThemeForToday, Theme } from './config/specialDays';

export default function Home() {
  const [mode, setMode] = useState<'year' | 'focus'>('year');
  const [yearProgress, setYearProgress] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  // State quản lý Theme (Ngày lễ)
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);

  // Focus Mode State
  const [inputMinutes, setInputMinutes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Tính % năm và Check Theme
  useEffect(() => {
    // Kiểm tra xem hôm nay có phải ngày đặc biệt không
    const theme = getThemeForToday();
    setCurrentTheme(theme);

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

  // Hàm tạo tiếng Chuông Thiền (Zen Bell)
  const playZenBell = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const now = ctx.currentTime;
      const frequencies = [246.94, 493.88, 740.82]; 
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(index === 0 ? 0.4 : 0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 4);
      });
    } catch (e) {
      console.error("Zen Bell Error:", e);
    }
  };

  // 2. Timer Logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playZenBell();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || parseInt(val) >= 0) setInputMinutes(val);
  };

  const startFocus = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseFloat(inputMinutes);
    if (mins > 0) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      setTotalFocusTime(mins * 60);
      setTimeLeft(Math.floor(mins * 60));
      setIsTimerRunning(true);
    }
  };

  const focusProgress = totalFocusTime > 0 ? ((totalFocusTime - timeLeft) / totalFocusTime) * 100 : 0;

  // Lấy màu từ theme (nếu có) hoặc dùng màu đỏ mặc định
  const activeBarColor = currentTheme?.barColor || '#DC2626';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4 overflow-hidden relative font-sans text-black">
      
      <div className="w-full max-w-md text-center flex flex-col items-center space-y-10">
        
        {mode === 'year' && (
          <div className="w-full space-y-10 animate-in fade-in duration-500">
            {/* Số năm */}
            <h1 className="text-4xl font-black tracking-tighter uppercase">{year}</h1>
            
            {/* Thanh Progress Bar */}
            <div className="relative w-full h-10 border-[3px] border-black p-1 bg-white overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.1)]">
              <div 
                className="h-full transition-all duration-1000 ease-linear relative" 
                style={{ 
                  width: `${yearProgress}%`,
                  backgroundColor: activeBarColor // Chỉ đổi màu nền của thanh bar
                }} 
              >
                 {/* Icon chạy theo thanh Progress */}
                 {currentTheme?.emoji && (
                  <span 
                    className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-2xl z-10 filter drop-shadow-sm"
                    style={{ right: '-10px' }} 
                  >
                    {currentTheme.emoji}
                  </span>
                )}
              </div>
            </div>

            {/* Phần trăm: Luôn màu đen */}
            <p className="text-xl font-bold tabular-nums text-black">
              {yearProgress.toFixed(5)}%
            </p>

            {/* Thông điệp ngày lễ: Bỏ in nghiêng (italic), in đậm (font-bold), màu đen */}
            {currentTheme?.message && (
              <p className="text-sm font-bold mt-2 animate-pulse text-black">
                {currentTheme.message}
              </p>
            )}
          </div>
        )}

        {mode === 'focus' && (
          <div className="w-full space-y-8 animate-in fade-in duration-500">
            {!isTimerRunning && timeLeft === 0 ? (
              <form onSubmit={startFocus} className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">How long do you want to focus?</h2>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <input type="number" step="any" min="0" value={inputMinutes} onChange={handleInputChange} placeholder="0" className="w-20 text-center text-4xl font-black border-b-4 border-black focus:outline-none" autoFocus />
                    <span className="text-xl font-medium text-gray-400">minutes</span>
                  </div>
                  <p className="text-xs text-gray-400 italic tracking-wide animate-pulse">Press Enter to start</p>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <h2 className="text-3xl font-black uppercase tracking-widest">{inputMinutes} MINUTES</h2>
                <div className="relative w-full h-10 border-[3px] border-black p-1 bg-white overflow-hidden">
                  <div className="h-full bg-black transition-all duration-1000 ease-linear" style={{ width: `${focusProgress}%` }} />
                </div>
                <p className="text-xl font-bold tabular-nums">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                <button onClick={() => { setIsTimerRunning(false); setTimeLeft(0); }} className="text-xs font-bold text-red-500 uppercase underline tracking-tighter">Reset</button>
              </div>
            )}
          </div>
        )}

        {/* Nút Go to Focus / Back to Year */}
        <div className="pt-20">
          <button 
            onClick={() => { setMode(mode === 'year' ? 'focus' : 'year'); setIsTimerRunning(false); setTimeLeft(0); }}
            className="bg-[#f2f2f2] text-[#888] px-6 py-2 rounded-xl font-semibold text-xs hover:bg-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-95"
          >
            {mode === 'year' ? 'Go to Focus' : 'Back to Year'}
          </button>
        </div>
      </div>
    </main>
  );
}