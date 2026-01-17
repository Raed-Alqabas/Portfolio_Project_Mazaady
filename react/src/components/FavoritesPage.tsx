import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Heart, Clock, TrendingUp, Trash2, Grid3x3, List, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import Swal from "sweetalert2";
import axios from "../api/axios";

interface FavoriteAuction {
  id: number;
  title: string;
  currentBid: number;
  startingPrice: number;
  endTime: string;
  image: string;
  status: "active" | "ending-soon" | "ended";
  bids: number;
  location: string;
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const { user }: any = useOutletContext();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [favorites, setFavorites] = useState<FavoriteAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !localStorage.getItem('access')) {
      Swal.fire({
        icon: 'warning',
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول للوصول إلى المفضلة',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#1e3a5f'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/favorites/');
      const data = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        currentBid: item.currentBid,
        startingPrice: item.startingPrice,
        endTime: "حسب الحالة", // Placeholder
        image: item.image || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
        status: item.status === 'active' ? 'active' : 'ended',
        bids: item.bids,
        location: item.location,
      }));
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('فشل تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: number, title: string) => {
    try {
      await axios.delete(`/favorites/${id}/remove/`);
      setFavorites(favorites.filter((fav: FavoriteAuction) => fav.id !== id));
      toast.success(`تم إزالة "${title}" من المفضلة`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('فشل إزالة المفضلة');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">
            نشط
          </Badge>
        );
      case "ending-soon":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20">
            ينتهي قريباً
          </Badge>
        );
      case "ended":
        return (
          <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">
            منتهي
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredFavorites = favorites.filter((fav: FavoriteAuction) =>
    fav.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-gray-900">مفضلتي</h1>
              <p className="text-gray-600 text-sm">
                {favorites.length} سيارة محفوظة في المفضلة
              </p>
            </div>
          </div>
        </div>

        {favorites.length > 0 ? (
          <>
            {/* Filters & Controls */}
            <Card className="mb-6 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="ابحث في المفضلة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">الأحدث</SelectItem>
                      <SelectItem value="ending">ينتهي قريباً</SelectItem>
                      <SelectItem value="price-low">السعر: الأقل</SelectItem>
                      <SelectItem value="price-high">السعر: الأعلى</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      onClick={() => setViewMode("grid")}
                      className="h-8 px-3"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "default" : "ghost"}
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favorites Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((auction) => (
                  <Card
                    key={auction.id}
                    className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <Link to={`/auction/${auction.id}`}>
                      {/* Image */}
                      <div className="relative aspect-video overflow-hidden bg-gray-200">
                        <img
                          src={auction.image}
                          alt={auction.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(auction.status)}
                        </div>

                        {/* Time & Bid Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{auction.endTime}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xs opacity-90">المزايدة الحالية</div>
                              <div className="font-bold">
                                {auction.currentBid.toLocaleString()} ريال
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
                          {auction.title}
                        </h3>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>{auction.location}</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {auction.bids} مزايدة
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>سعر البداية</span>
                            <span className="text-green-600 font-medium">
                              +{((auction.currentBid - auction.startingPrice) / auction.startingPrice * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((auction.currentBid - auction.startingPrice) / auction.startingPrice) * 100 + 20, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Link>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <Link to={`/auction/${auction.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          عرض التفاصيل
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(auction.id, auction.title)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavorites.map((auction) => (
                  <Card
                    key={auction.id}
                    className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        {/* Image */}
                        <Link
                          to={`/auction/${auction.id}`}
                          className="flex-shrink-0"
                        >
                          <div className="relative w-48 h-32 overflow-hidden rounded-lg bg-gray-200">
                            <img
                              src={auction.image}
                              alt={auction.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <div className="absolute top-2 right-2">
                              {getStatusBadge(auction.status)}
                            </div>
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/auction/${auction.id}`}>
                            <h3 className="text-gray-900 mb-2 hover:text-primary transition-colors">
                              {auction.title}
                            </h3>
                          </Link>

                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">المزايدة الحالية</div>
                              <div className="font-bold text-primary">
                                {auction.currentBid.toLocaleString()} ريال
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">الوقت المتبقي</div>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-3 h-3" />
                                {auction.endTime}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">عدد المزايدات</div>
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="w-3 h-3" />
                                {auction.bids} مزايدة
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link to={`/auction/${auction.id}`}>
                              <Button size="sm">عرض التفاصيل</Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFavorite(auction.id, auction.title)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              إزالة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-gray-900 mb-3">لا توجد سيارات في المفضلة</h2>
                <p className="text-gray-600 mb-6">
                  لم تقم بإضافة أي سيارات إلى قائمة المفضلة بعد. ابدأ بتصفح المزادات وأضف السيارات التي تعجبك
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/auctions">
                    <Button className="gap-2">
                      <TrendingUp className="w-4 h-4" />
                      تصفح المزادات
                    </Button>
                  </Link>
                  <Link to="/cars">
                    <Button variant="outline" className="gap-2">
                      <Search className="w-4 h-4" />
                      البحث عن سيارات
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}