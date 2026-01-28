import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Gavel, Car, Home, LogIn, User, LogOut, ClipboardList, Megaphone, Heart, Search, ShoppingCart, Bell, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { AuthDialog } from "./AuthDialog";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import logoImage from "../assets/main-logo-2.svg";
import logoImageWhite from "../assets/main-logo-2-w.PNG";
import { LoadingScreen } from "./LoadingScreen";

import axios from "../api/axios";
import { ScrollToTop } from "./ScrollToTop";

import { logout } from "../api/auth";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [bidsCount, setBidsCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Navigation items
  const navItems = [
    { path: "/", label: "الرئيسية", icon: Home },
    { path: "/auctions", label: "المزادات", icon: Gavel },
    { path: "/cars", label: "السيارات", icon: Car },
  ];

  const userMenuItems = [
    { path: "/favorites", label: "المفضلة", icon: Heart, count: favoritesCount, isAlert: false },
    { path: "/my-bids", label: "مزايداتي", icon: Gavel, count: bidsCount, isAlert: false },
    { path: "/notifications", label: "الإشعارات", icon: Bell, count: notificationCount, isAlert: true },
  ];

  // Track window width for responsive menu behavior
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    // Only fetch counts if user is logged in
    if (!user) {
      setFavoritesCount(0);
      setBidsCount(0);
      setNotificationCount(0);
      return;
    }

    fetchNotificationCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);

    // Listen for real-time favorites changes
    const handleFavoritesChange = () => {
      fetchNotificationCounts();
    };

    window.addEventListener('favorites-changed', handleFavoritesChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('favorites-changed', handleFavoritesChange);
    };
  }, [user]);

  // Handle window resize for responsive menu
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024);
      // Close mobile menu if switching to desktop
      if (width >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/auth/me/');
      setUser({
        name: response.data.username,
        email: response.data.email
      });
      fetchNotificationCounts();
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // Token is invalid, clear it
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  };

  const fetchNotificationCounts = async () => {
    if (!user) {
      setFavoritesCount(0);
      setBidsCount(0);
      setNotificationCount(0);
      return;
    }

    try {
      const [favResponse, bidsResponse, notifResponse] = await Promise.all([
        axios.get('/favorites/count/'),
        axios.get('/my-bids/count/'),
        axios.get('/notifications/count/')
      ]);
      setFavoritesCount(favResponse.data.count || 0);
      setBidsCount(bidsResponse.data.count || 0);
      const notifCount = notifResponse.data.count || 0;
      console.log('Notification count fetched:', notifCount);
      setNotificationCount(notifCount);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    fetchNotificationCounts();
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setFavoritesCount(0);
    setBidsCount(0);
    setNotificationCount(0);
    localStorage.removeItem('user');

    // Redirect to home and scroll to top
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    toast.success("تم تسجيل الخروج بنجاح");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search bar after navigating
    }
  };

  // Navigation helper function
  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Auto-logout logic
  const lastActivityRef = useRef(Date.now());
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        handleLogout();
        navigate("/");
        toast.info("تم تسجيل الخروج تلقائياً بسبب الخمول", {
          description: "تمت إعادة توجيهك إلى الصفحة الرئيسية",
        });
      }
    }, 30000); // Check every 30 seconds

    // Multi-event activity tracking
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    return () => {
      clearInterval(checkInactivity);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
    };
  }, [user, navigate]);

  // Restore user from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("access"); // Changed from "token" to "access"
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Handle route change loading
  useEffect(() => {
    // Only show loader if we're actually changing paths (not just params/hash if desired)
    // But usually any location change is enough
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {pageLoading && <LoadingScreen />}
      <ScrollToTop />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
            {/* Mobile Menu Button - Using new Burger Icon */}
            {!isDesktop && (
              <div
                className={`burger-icon ${mobileMenuOpen ? 'open' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            {/* Logo */}
            <div className={`flex-shrink-0 cursor-pointer group z-50 transition-colors duration-300 ${mobileMenuOpen ? 'text-white' : 'text-gray-900'}`} onClick={() => handleNavigation('/')}>
              <img
                src={mobileMenuOpen ? logoImageWhite : logoImage}
                alt="مزادي"
                className="h-15 lg:h-17 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
            </div>


            {/* Desktop Navigation Bar - ONLY VISIBLE ON DESKTOP (lg and above) */}
            {isDesktop && (
              <div className="border-t border-gray-100 bg-gray-50/50 rounded-md">
                <div className="container mx-auto px-4">
                  <nav className="flex items-center justify-center gap-1 h-14">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Button
                          key={item.path}
                          variant={active ? "default" : "ghost"}
                          onClick={() => handleNavigation(item.path)}
                          className={
                            active
                              ? "gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
                              : "gap-2 text-gray-700 hover:bg-white hover:text-blue-600 rounded-xl"
                          }
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}
            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 my-1">
              {/* Desktop Action Icons - Only on Desktop (hidden on <lg, visible on lg:1024px+) */}
              {user && (
                <div className="hidden md:block">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigation('/favorites')}
                      className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" />
                      {favoritesCount > 0 && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {favoritesCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleNavigation('/my-bids')}
                      className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <Gavel className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      {bidsCount > 0 && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                          {bidsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleNavigation('/notifications')}
                      className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <Bell className="w-6 h-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-1"></div>
                  </div>
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 h-10 lg:h-12 px-2 lg:px-4 hover:bg-gray-100 rounded-xl">
                      <Avatar className="w-8 h-8 border-2 border-gray-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-sm text-gray-700 font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
                      <LayoutDashboard className="ml-2 w-4 h-4" />
                      لوحة التحكم
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                      <User className="ml-2 w-4 h-4" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/my-bids')}>
                      <Gavel className="ml-2 w-4 h-4" />
                      مزايداتي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/my-ads')}>
                      <Megaphone className="ml-2 w-4 h-4" />
                      إعلاناتي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/favorites')}>
                      <Heart className="ml-2 w-4 h-4" />
                      المفضلة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="ml-2 w-4 h-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setAuthOpen(true)} className="gap-2 h-10 lg:h-12 px-4 lg:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:block">تسجيل الدخول</span>
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Mega Menu Overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : 'closed'}`}>
          <div className="container mx-auto px-6 py-24 h-full flex flex-col justify-center">
            <nav className="flex flex-col gap-8 text-center">
              {/* Main Navigation Items */}
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`text-3xl font-bold transition-all duration-300 hover:text-blue-500 hover:scale-105 ${active ? 'text-blue-500' : 'text-white'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* User Menu Items - Only if logged in */}
              {user && (
                <>
                  <div className="w-16 h-1 bg-gray-700 mx-auto rounded-full my-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <Icon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-gray-300 text-sm font-medium group-hover:text-white">{item.label}</span>
                          {item.count > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-all group col-span-2"
                    >
                      <LogOut className="w-8 h-8 text-red-500" />
                      <span className="text-red-500 text-sm font-medium">تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onLogin={handleLogin} />
      <Toaster />

      {/* Main Content */}
      <main>
        <Outlet context={{ user, setAuthOpen }} />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link to="/" className="flex-shrink-0 group">
                  <img
                    src={logoImageWhite}
                    alt="مزادي"
                    className="h-15 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                منصة مزادي - منصة بيع وشراء السيارات المستعملة وانت في بيتك
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-white">روابط سريعة</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link to="/auctions" className="text-gray-400 hover:text-white transition-colors text-sm">
                    المزادات
                  </Link>
                </li>
                <li>
                  <Link to="/cars" className="text-gray-400 hover:text-white transition-colors text-sm">
                    السيارات
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link to="/my-bids" className="text-gray-400 hover:text-white transition-colors text-sm">
                      مزايداتي
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-white">الشروط والسياسات</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    الشروط والأحكام
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    سياسة الخصوصية
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-white">تواصل معنا</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@mazady.sa" className="text-gray-400 hover:text-white transition-colors">
                    info@mazady.sa
                  </a>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+966920001234" className="text-gray-400 hover:text-white transition-colors" dir="ltr">
                    +966 920001234
                  </a>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400">
                    الأحد - الخميس<br />9 ص - 5 م
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 منصة مزادي. جميع الحقوق محفوظة
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toast.info("قريبًا - صفحة الفيسبوك قيد الإنشاء")}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.info("قريباً - صفحة X قيد الإنشاء")}

                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  onClick={() => toast.info("قريبًا - صفحة الإنستغرام قيد الإنشاء")}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}