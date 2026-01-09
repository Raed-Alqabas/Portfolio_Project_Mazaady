
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Heart, Clock, TrendingUp, Trash2, Grid3x3, List, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { getFavorites, toggleFavorite, FavoriteItem } from "../api/favorites";
import { CarCard } from "./CarCard";

export function FavoritesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Failed to load favorites", error);
      toast.error("فشل في تحميل المفضلة");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: number, title: string) => {
    try {
      await toggleFavorite(id);
      setFavorites(favorites.filter((fav) => fav.id !== id));
      toast.success(`تم إزالة "${title}" من المفضلة`);
    } catch (error) {
      console.error("Failed to remove favorite", error);
      toast.error("حدث خطأ في تحديث المفضلة");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">نشط</Badge>;
      case "ending-soon":
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20">ينتهي قريباً</Badge>;
      case "ended":
        return <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20">منتهي</Badge>;
      default:
        return null;
    }
  };

  const filteredFavorites = favorites.filter((fav) =>
    fav.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
     return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                   <CarCard
                     key={auction.id}
                     id={auction.id}
                     title={auction.title}
                     brand="" 
                     model=""
                     year={2024} 
                     mileage={0}
                     fuel=""
                     transmission=""
                     location={auction.location}
                     currentBid={auction.currentBid}
                     endTime={auction.endTime}
                     image={auction.image}
                     isFavorited={true}
                   />
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
                             {auction.image && (
                                <img
                                src={auction.image}
                                alt={auction.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                             )}
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}