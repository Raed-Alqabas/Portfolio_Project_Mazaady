// Mock data for the auction platform

export interface Auction {
  id: number;
  title: string;
  description: string;
  currentBid: number;
  startingPrice: number;
  endTime: string;
  image: string;
  bids: number;
  category: string;
  status: "active" | "ending-soon" | "ended" | "upcoming";
  location: string;
  year: number;
  mileage: number;
  seller: string;
}

export const mockAuctions: Auction[] = [
  {
    id: 1,
    title: "تويوتا كامري 2023 - فل كامل",
    description: "حالة ممتازة - فحص شامل - صيانة دورية منتظمة",
    currentBid: 85000,
    startingPrice: 75000,
    endTime: "3 ساعات و 24 دقيقة",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
    bids: 24,
    category: "سيدان",
    status: "active",
    location: "الرياض",
    year: 2023,
    mileage: 15000,
    seller: "معرض النجوم للسيارات",
  },
  {
    id: 2,
    title: "مرسيدس E-Class 2022 - بحالة ممتازة",
    description: "كامل المواصفات - صيانة وكالة - خالية من الحوادث",
    currentBid: 180000,
    startingPrice: 165000,
    endTime: "45 دقيقة",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500",
    bids: 31,
    category: "سيدان",
    status: "ending-soon",
    location: "جدة",
    year: 2022,
    mileage: 28000,
    seller: "معرض الفخامة",
  },
  {
    id: 3,
    title: "هوندا أكورد 2024 - موديل حديث",
    description: "جديدة - لم تستخدم - ضمان المصنع",
    currentBid: 95000,
    startingPrice: 88000,
    endTime: "12 ساعة",
    image: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=500",
    bids: 18,
    category: "سيدان",
    status: "active",
    location: "الدمام",
    year: 2024,
    mileage: 5000,
    seller: "وكالة السعودية للسيارات",
  },
  {
    id: 4,
    title: "BMW X5 2021 - دفع رباعي",
    description: "فل كامل - بحالة الوكالة - سيرفس منتظم",
    currentBid: 210000,
    startingPrice: 195000,
    endTime: "منتهي",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500",
    bids: 42,
    category: "دفع رباعي",
    status: "ended",
    location: "الرياض",
    year: 2021,
    mileage: 45000,
    seller: "معرض الخليج للسيارات الفاخرة",
  },
  {
    id: 5,
    title: "لكزس ES 2023 - هايبرد",
    description: "هايبرد - اقتصادية - صديقة للبيئة",
    currentBid: 145000,
    startingPrice: 135000,
    endTime: "6 ساعات",
    image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=500",
    bids: 27,
    category: "سيدان",
    status: "active",
    location: "الرياض",
    year: 2023,
    mileage: 12000,
    seller: "معرض لكزس المعتمد",
  },
  {
    id: 6,
    title: "جيب رانجلر 2022 - معدلة",
    description: "معدلة - جاهزة للبر - إطارات جديدة",
    currentBid: 165000,
    startingPrice: 150000,
    endTime: "1 ساعة",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
    bids: 35,
    category: "دفع رباعي",
    status: "ending-soon",
    location: "الطائف",
    year: 2022,
    mileage: 35000,
    seller: "معرض المغامرات",
  },
  {
    id: 7,
    title: "أودي A6 2024 - قريباً",
    description: "قريباً - قيد المراجعة - موديل حديث",
    currentBid: 0,
    startingPrice: 200000,
    endTime: "يبدأ خلال 2 أيام",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
    bids: 0,
    category: "سيدان",
    status: "upcoming",
    location: "جدة",
    year: 2024,
    mileage: 0,
    seller: "وكالة أودي المعتمدة",
  },
  {
    id: 8,
    title: "تويوتا لاند كروزر 2023 - GXR",
    description: "قريباً - قيد المراجعة - فل كامل",
    currentBid: 0,
    startingPrice: 280000,
    endTime: "يبدأ خلال 3 أيام",
    image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=500",
    bids: 0,
    category: "دفع رباعي",
    status: "upcoming",
    location: "الرياض",
    year: 2023,
    mileage: 8000,
    seller: "معرض تويوتا الرسمي",
  },
  {
    id: 9,
    title: "فورد موستنج 2023 - GT",
    description: "رياضية - محرك V8 - أداء عالي",
    currentBid: 195000,
    startingPrice: 180000,
    endTime: "7 ساعات",
    image: "https://images.unsplash.com/photo-1584345604476-8ec5f2e49f83?w=500",
    bids: 29,
    category: "رياضية",
    status: "active",
    location: "الدمام",
    year: 2023,
    mileage: 10000,
    seller: "معرض السرعة",
  },
  {
    id: 10,
    title: "نيسان باترول 2022 - بلاتينيوم",
    description: "فل كامل - 8 سلندر - بحالة الوكالة",
    currentBid: 175000,
    startingPrice: 160000,
    endTime: "9 ساعات",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500",
    bids: 33,
    category: "دفع رباعي",
    status: "active",
    location: "مكة المكرمة",
    year: 2022,
    mileage: 38000,
    seller: "معرض نيسان المعتمد",
  },
];

export const getAuctionById = (id: number): Auction | undefined => {
  return mockAuctions.find((auction) => auction.id === id);
};

export const getActiveAuctions = (): Auction[] => {
  return mockAuctions.filter(
    (auction) => auction.status === "active" || auction.status === "ending-soon"
  );
};

export const getFeaturedAuctions = (limit: number = 3): Auction[] => {
  return getActiveAuctions().slice(0, limit);
};
