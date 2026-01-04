import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Car, 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon,
  Calendar,
  Gauge,
  Fuel,
  DollarSign,
  MapPin,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export function AddCarPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [inspectionReport, setInspectionReport] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    // Basic Info
    brand: "",
    model: "",
    year: "",
    color: "",
    
    // Technical Details
    mileage: "",
    fuel: "",
    transmission: "",
    engineSize: "",
    cylinders: "",
    
    // Condition
    condition: "",
    accidents: "",
    
    // Location & Documents
    location: "",
    vin: "",
    
    // Description
    title: "",
    description: "",
    
    // Auction Details
    startBid: "",
    reservePrice: "",
    auctionDuration: "3",
    
    // Additional Features
    features: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate image upload - in real app, you'd upload to server
      const newImages = Array.from(files).slice(0, 10 - images.length).map((file) => {
        return URL.createObjectURL(file);
      });
      setImages(prev => [...prev, ...newImages]);
      toast.success(`تم إضافة ${newImages.length} صورة`);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInspectionReport(file);
      toast.success("تم إرفاق تقرير الفحص");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.brand || !formData.model || !formData.year) {
      toast.error("يرجى ملء جميع الحقول الأساسية");
      return;
    }
    
    if (images.length === 0) {
      toast.error("يرجى إضافة صورة واحدة على الأقل");
      return;
    }
    
    if (!formData.startBid) {
      toast.error("يرجى تحديد سعر البداية");
      return;
    }

    // Simulate form submission
    toast.success("تم إضافة الإعلان بنجاح! سيتم مراجعته قريباً");
    navigate("/my-ads");
  };

  const carBrands = [
    "تويوتا", "مرسيدس", "BMW", "هوندا", "لكزس", "جيب", 
    "نيسان", "هيونداي", "كيا", "شفروليه", "فورد", "مازدا"
  ];

  const fuelTypes = ["بنزين", "ديزل", "هايبرد", "كهربائي"];
  const transmissionTypes = ["أوتوماتيك", "مانيوال"];
  const conditionTypes = ["ممتازة", "جيدة جداً", "جيدة", "مقبولة"];
  const locations = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الخبر", "الطائف"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/my-ads")}
            className="gap-2 mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى إعلاناتي
          </Button>
          <h1 className="mb-2">إضافة إعلان جديد</h1>
          <p className="text-gray-600">أضف سيارتك للمزاد العلني</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                صور السيارة
              </CardTitle>
              <CardDescription>
                أضف صور واضحة للسيارة (حد أقصى 10 صور)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                      <img src={img} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 10 && (
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">إضافة صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {images.length} / 10 صور
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الإعلان *</Label>
                  <Input
                    id="title"
                    placeholder="مثال: تويوتا كامري 2023 فل كامل"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">الماركة *</Label>
                  <Select value={formData.brand} onValueChange={(value) => handleInputChange("brand", value)}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="اختر الماركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {carBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">الموديل *</Label>
                  <Input
                    id="model"
                    placeholder="مثال: كامري"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">سنة الصنع *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2023"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">اللون *</Label>
                  <Input
                    id="color"
                    placeholder="مثال: أبيض"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف السيارة</Label>
                <Textarea
                  id="description"
                  placeholder="اكتب وصفاً تفصيلياً للسيارة وحالتها ومميزاتها..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                المواصفات الفنية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mileage">المسافة المقطوعة (كم) *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="15000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel">نوع الوقود *</Label>
                  <Select value={formData.fuel} onValueChange={(value) => handleInputChange("fuel", value)}>
                    <SelectTrigger id="fuel">
                      <SelectValue placeholder="اختر نوع الوقود" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">ناقل الحركة *</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                    <SelectTrigger id="transmission">
                      <SelectValue placeholder="اختر ناقل الحركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engineSize">سعة المحرك (لتر)</Label>
                  <Input
                    id="engineSize"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.engineSize}
                    onChange={(e) => handleInputChange("engineSize", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cylinders">عدد الأسطوانات</Label>
                  <Input
                    id="cylinders"
                    type="number"
                    placeholder="4"
                    value={formData.cylinders}
                    onChange={(e) => handleInputChange("cylinders", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">الحالة العامة *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vin">رقم الهيكل (VIN)</Label>
                  <Input
                    id="vin"
                    placeholder="JTDKARFU5L3123456"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accidents">هل تعرضت لحوادث؟ *</Label>
                  <Select value={formData.accidents} onValueChange={(value) => handleInputChange("accidents", value)}>
                    <SelectTrigger id="accidents">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">لا يوجد</SelectItem>
                      <SelectItem value="minor">حوادث طفيفة</SelectItem>
                      <SelectItem value="major">حوادث كبيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                تقرير الفحص
              </CardTitle>
              <CardDescription>
                إرفاق تقرير فحص السيارة (اختياري لكن يزيد من مصداقية الإعلان)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inspectionReport ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-green-900">{inspectionReport.name}</p>
                      <p className="text-sm text-green-600">
                        {(inspectionReport.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectionReport(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-700 mb-1">اضغط لإرفاق تقرير الفحص</p>
                  <p className="text-sm text-gray-500">PDF, DOC, DOCX (حد أقصى 10MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleReportUpload}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Auction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                تفاصيل المزاد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startBid">سعر البداية (ريال) *</Label>
                  <Input
                    id="startBid"
                    type="number"
                    placeholder="75000"
                    value={formData.startBid}
                    onChange={(e) => handleInputChange("startBid", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reservePrice">السعر الاحتياطي (ريال)</Label>
                  <Input
                    id="reservePrice"
                    type="number"
                    placeholder="90000"
                    value={formData.reservePrice}
                    onChange={(e) => handleInputChange("reservePrice", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    الحد الأدنى للسعر الذي ترغب في بيع السيارة به
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auctionDuration">مدة المزاد *</Label>
                  <Select value={formData.auctionDuration} onValueChange={(value) => handleInputChange("auctionDuration", value)}>
                    <SelectTrigger id="auctionDuration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">يوم واحد</SelectItem>
                      <SelectItem value="3">3 أيام</SelectItem>
                      <SelectItem value="5">5 أيام</SelectItem>
                      <SelectItem value="7">7 أيام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">رسوم النشر:</p>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>رسوم الإعلان</span>
                    <span>500 ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عمولة المنصة عند البيع</span>
                    <span>2.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 gap-2">
                  <CheckCircle className="w-5 h-5" />
                  نشر الإعلان
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-ads")}
                >
                  إلغاء
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                سيتم مراجعة الإعلان والموافقة عليه خلال 24 ساعة
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
