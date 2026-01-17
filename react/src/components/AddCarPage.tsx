import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [inspectionReport, setInspectionReport] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    brand: "",
    model: "",
    year: "",
    color: "",
    bodyType: "",

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
    auctionDuration: "1",
    startDate: "",

    // Additional Features
    features: [] as string[],
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Validation helper functions
  const validateYear = (year: string): string => {
    if (!year) return "";
    const numYear = parseInt(year);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(numYear)) return "السنة يجب أن تكون رقماً";
    if (numYear < 1886) return "السنة يجب أن تكون 1886 أو أحدث";
    if (numYear > currentYear + 1) return `السنة يجب أن لا تتجاوز ${currentYear + 1}`;
    
    return "";
  };

  const validateModel = (model: string): string => {
    if (!model) return "";
    // Allow letters, numbers, spaces, hyphens (for models like X5, Mazda 3, etc.)
    // But ensure it's not ALL numbers
    if (/^\d+$/.test(model)) return "اسم الموديل لا يمكن أن يكون أرقاماً فقط";
    if (!/^[a-zA-Z0-9\s\-أ-ي]+$/.test(model)) return "اسم الموديل يحتوي على أحرف غير صالحة";
    
    return "";
  };

  const validateVIN = (vin: string): string => {
    if (!vin) return "";
    
    if (vin.length !== 17) return "رقم الهيكل يجب أن يكون 17 حرفاً بالضبط";
    if (/[IOQioq]/.test(vin)) return "رقم الهيكل لا يمكن أن يحتوي على الأحرف I أو O أو Q";
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return "رقم الهيكل يحتوي على أحرف غير صالحة";
    
    return "";
  };

  const validateMileage = (mileage: string): string => {
    if (!mileage) return "";
    const numMileage = parseInt(mileage);
    
    if (isNaN(numMileage)) return "المسافة يجب أن تكون رقماً";
    if (numMileage < 0) return "المسافة لا يمكن أن تكون سالبة";
    if (numMileage > 999999) return "المسافة غير منطقية (الحد الأقصى 999,999 كم)";
    
    return "";
  };

  const validateEngineSize = (size: string): string => {
    if (!size) return "";
    const numSize = parseFloat(size);
    
    if (isNaN(numSize)) return "سعة المحرك يجب أن تكون رقماً";
    if (numSize < 0.6) return "سعة المحرك يجب أن تكون 0.6 لتر على الأقل";
    if (numSize > 8.0) return "سعة المحرك غير منطقية (الحد الأقصى 8.0 لتر)";
    
    return "";
  };

  const validatePrice = (price: string, fieldName: string): string => {
    if (!price) return "";
    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) return `${fieldName} يجب أن يكون رقماً`;
    if (numPrice <= 0) return `${fieldName} يجب أن يكون أكبر من صفر`;
    
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let error = "";
    switch(field) {
      case "year":
        error = validateYear(value);
        break;
      case "model":
        error = validateModel(value);
        break;
      case "vin":
        error = validateVIN(value);
        break;
      case "mileage":
        error = validateMileage(value);
        break;
      case "engineSize":
        error = validateEngineSize(value);
        break;
      case "startBid":
        error = validatePrice(value, "سعر البداية");
        break;
      case "reservePrice":
        error = validatePrice(value, "السعر الاحتياطي");
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 20 - images.length;
      const fileList = Array.from(files).slice(0, remainingSlots);

      if (fileList.length === 0 && Array.from(files).length > 0) {
        toast.error("لقد وصلت للحد الأقصى من الصور (20)");
        return;
      }

      const newImageUrls = fileList.map((file) => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImageUrls]);
      setImageFiles(prev => [...prev, ...fileList]);
      toast.success(`تم إضافة ${fileList.length} صورة`);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInspectionReport(file);
      toast.success("تم إرفاق تقرير الفحص");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.brand || !formData.model || !formData.year) {
      toast.error("يرجى ملء جميع الحقول الأساسية");
      return;
    }

    if (imageFiles.length < 10) {
      toast.error("يرجى إضافة 10 صور على الأقل (بحد أقصى 20)");
      return;
    }

    if (!formData.startBid) {
      toast.error("يرجى تحديد سعر البداية");
      return;
    }

    if (!formData.startDate) {
      toast.error("يرجى تحديد تاريخ ووقت بدء المزاد");
      return;
    }

    const startDateTime = new Date(formData.startDate);
    const startHour = startDateTime.getHours();
    const startMinutes = startDateTime.getMinutes();

    // Check if time is between 8:00 AM and 2:00 PM (14:00)
    // 8:00 is allowed. 14:00 is allowed. 14:01 is not.
    if (startHour < 8 || (startHour > 14 || (startHour === 14 && startMinutes > 0))) {
      toast.error("يجب أن يكون وقت بدء المزاد بين الساعة 8 صباحاً و 2 ظهراً");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();

    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'features') {
        data.append(key, JSON.stringify(value));
      } else {
        // cast to string to avoid lint error
        data.append(key, value as string);
      }
    });

    // Special handling for decimal/int fields if needed, but strings are usually fine for DRF MultiPart
    // Convert snake_case names if necessary for backend
    data.set('start_bid', formData.startBid);
    data.set('reserve_price', formData.reservePrice);
    data.set('engine_size', formData.engineSize);
    data.set('auction_duration', formData.auctionDuration);

    // startDate is now required
    data.set('start_date', formData.startDate);
    data.set('body_type', formData.bodyType);

    const start = new Date(formData.startDate);
    const now = new Date();
    if (start > now) {
      data.set('status', 'PENDING');
    }

    // Append images
    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    // Append inspection report
    if (inspectionReport) {
      data.append('inspection_report', inspectionReport);
    }

    try {
      await api.post("/cars/add/", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("تم إضافة الإعلان بنجاح! سيتم مراجعته قريباً");
      navigate("/my-ads");
    } catch (error: any) {
      console.error("Error adding car:", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء إضافة الإعلان");
    } finally {
      setIsSubmitting(false);
    }
  };

  const carBrands = [
    "تويوتا", "مرسيدس", "BMW", "هوندا", "لكزس", "جيب",
    "نيسان", "هيونداي", "كيا", "شفروليه", "فورد", "مازدا"
  ];

  const validColors = [
    "أسود", "أبيض", "فضي", "رمادي", "أحمر", "أزرق", "أخضر",
    "أصفر", "برتقالي", "بني", "بيج", "ذهبي", "بنفسجي",
    "أبيض لؤلؤي", "فضي معدني", "أسود مطفي", "أزرق غامق",
    "أزرق سماوي", "رمادي غامق", "رمادي فاتح", "أخضر غامق"
  ];

  const validCylinders = ["2", "3", "4", "5", "6", "8", "10", "12", "16"];

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
          <h1 className="mb-2 font-bold text-2xl">إضافة إعلان جديد</h1>
          <p className="text-gray-600">أضف سيارتك للمزاد العلني</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                صور السيارة
              </CardTitle>
              <CardDescription>
                أضف صور واضحة للسيارة (10-20 صورة)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group">
                      <img src={img} alt={`صورة ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 left-2 bg-red-500/80 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 20 && (
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
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
                <div className="flex justify-between items-center text-sm">
                  <span className={`${images.length < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                    {images.length} / 20 صور (الحد الأدنى 10)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
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
                  <Select value={formData.brand} onValueChange={(value: string) => handleInputChange("brand", value)}>
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
                  <Label htmlFor="bodyType">نوع الهيكل</Label>
                  <Select value={formData.bodyType} onValueChange={(value: string) => handleInputChange("bodyType", value)}>
                    <SelectTrigger id="bodyType">
                      <SelectValue placeholder="اختر نوع الهيكل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">سيدان</SelectItem>
                      <SelectItem value="suv">دفع رباعي (SUV)</SelectItem>
                      <SelectItem value="sports">رياضية</SelectItem>
                      <SelectItem value="truck">شاحنة</SelectItem>
                      <SelectItem value="coupe">كوبيه</SelectItem>
                      <SelectItem value="convertible">كشف</SelectItem>
                      <SelectItem value="van">فان / عائلي</SelectItem>
                      <SelectItem value="hatchback">هاتشباك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">الموديل *</Label>
                  <Input
                    id="model"
                    placeholder="مثال: كامري أو X5"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    required
                    className={validationErrors.model ? "border-red-500" : ""}
                  />
                  {validationErrors.model && (
                    <p className="text-sm text-red-500">{validationErrors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">سنة الصنع *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2023"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    min={1886}
                    max={new Date().getFullYear() + 1}
                    required
                    className={validationErrors.year ? "border-red-500" : ""}
                  />
                  {validationErrors.year && (
                    <p className="text-sm text-red-500">{validationErrors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">اللون *</Label>
                  <Select value={formData.color} onValueChange={(value: string) => handleInputChange("color", value)}>
                    <SelectTrigger id="color">
                      <SelectValue placeholder="اختر اللون" />
                    </SelectTrigger>
                    <SelectContent>
                      {validColors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">الموقع *</Label>
                  <Select value={formData.location} onValueChange={(value: string) => handleInputChange("location", value)}>
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
                <Gauge className="w-5 h-5 text-primary" />
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
                    min={0}
                    max={999999}
                    required
                    className={validationErrors.mileage ? "border-red-500" : ""}
                  />
                  {validationErrors.mileage && (
                    <p className="text-sm text-red-500">{validationErrors.mileage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel">نوع الوقود *</Label>
                  <Select value={formData.fuel} onValueChange={(value: string) => handleInputChange("fuel", value)}>
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
                  <Select value={formData.transmission} onValueChange={(value: string) => handleInputChange("transmission", value)}>
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
                    min={0.6}
                    max={8.0}
                    className={validationErrors.engineSize ? "border-red-500" : ""}
                  />
                  {validationErrors.engineSize && (
                    <p className="text-sm text-red-500">{validationErrors.engineSize}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cylinders">عدد الأسطوانات</Label>
                  <Select value={formData.cylinders} onValueChange={(value: string) => handleInputChange("cylinders", value)}>
                    <SelectTrigger id="cylinders">
                      <SelectValue placeholder="اختر عدد الأسطوانات" />
                    </SelectTrigger>
                    <SelectContent>
                      {validCylinders.map(num => (
                        <SelectItem key={num} value={num}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">الحالة العامة *</Label>
                  <Select value={formData.condition} onValueChange={(value: string) => handleInputChange("condition", value)}>
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
                    onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                    maxLength={17}
                    className={validationErrors.vin ? "border-red-500" : ""}
                  />
                  {validationErrors.vin && (
                    <p className="text-sm text-red-500">{validationErrors.vin}</p>
                  )}
                  <p className="text-xs text-gray-500">17 حرفاً (بدون I, O, Q)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accidents">هل تعرضت لحوادث؟ *</Label>
                  <Select value={formData.accidents} onValueChange={(value: string) => handleInputChange("accidents", value)}>
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
                <FileText className="w-5 h-5 text-primary" />
                تقرير الفحص
              </CardTitle>
              <CardDescription>
                إرفاق تقرير فحص السيارة (اختياري)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inspectionReport ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-green-900 font-medium">{inspectionReport.name}</p>
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">اضغط لإرفاق تقرير الفحص</p>
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
                <DollarSign className="w-5 h-5 text-primary" />
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
                    min={1}
                    required
                    className={validationErrors.startBid ? "border-red-500" : ""}
                  />
                  {validationErrors.startBid && (
                    <p className="text-sm text-red-500">{validationErrors.startBid}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auctionDuration">مدة المزاد *</Label>
                  <Select value={formData.auctionDuration} onValueChange={(value: string) => handleInputChange("auctionDuration", value)}>
                    <SelectTrigger id="auctionDuration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">دقيقة واحدة (تجريبي)</SelectItem>
                      <SelectItem value="3">3 دقائق (تجريبي)</SelectItem>
                      <SelectItem value="360">6 ساعات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ بدء المزاد *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    يجب أن يكون وقت البدء بين 8:00 صباحاً و 2:00 ظهراً
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                {/* <p className="text-sm font-semibold text-primary mb-2">رسوم النشر:</p> */}
                <div className="space-y-1 text-sm text-gray-700">
                  {/* <div className="flex justify-between">
                    <span>رسوم الإعلان</span>
                    <span className="font-medium">500 ريال</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span>عمولة المنصة عند البيع</span>
                    <span className="font-medium">2.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 gap-2 text-lg h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      نشر الإعلان
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-ads")}
                  className="h-12 px-8"
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                سيتم مراجعة الإعلان والموافقة عليه خلال 24 ساعة
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
