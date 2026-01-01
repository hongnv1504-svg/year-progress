// app/config/specialDays.ts

export type Theme = {
  id: string;
  emoji?: string;      // Icon chạy trên thanh
  barColor?: string;   // Màu của thanh
  message?: string;    // Lời nhắn (nếu muốn)
};

// Lưu ý: Tháng trong JS bắt đầu từ 0 (Tháng 1 là 0, Tháng 2 là 1...)
// Nhưng để dễ cấu hình, mình viết hàm bên dưới dùng format "Tháng-Ngày" (1-1, 2-14)
export const SPECIAL_DAYS: Record<string, Theme> = {
  '1-1': { 
    id: 'new-year', 
    emoji: '🎆', 
    barColor: '#FFD700', // Màu vàng Gold
    message: 'Happy New Year!'
  },
  '2-14': { 
    id: 'valentine', 
    emoji: '❤️', 
    barColor: '#FF4D4D' // Màu đỏ
  },
  '12-25': { 
    id: 'christmas', 
    emoji: '🎄', 
    barColor: '#2F855A' // Màu xanh lá
  },
  // Hôm nay (để bạn test thử luôn, nhớ sửa lại ngày theo đúng hôm nay)
  '1-12': { 
    id: 'test-day', 
    emoji: '🔥', 
    barColor: '#000000' // Vẫn giữ đen cho ngầu
  }
};

export const getThemeForToday = (): Theme | null => {
  const today = new Date();
  // Lấy format "Tháng-Ngày" (ví dụ: 1-12)
  const dateKey = `${today.getMonth() + 1}-${today.getDate()}`;
  return SPECIAL_DAYS[dateKey] || null;
};