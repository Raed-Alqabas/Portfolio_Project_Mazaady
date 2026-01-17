import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
    CheckCircle,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

export function EditCarPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [inspectionReport, setInspectionReport] = useState<File | string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await api.get(`/cars/${id}/`);
                const data = response.data;

                setFormData({
                    brand: data.brand || "",
                    model: data.model || "",
                    year: data.year?.toString() || "",
                    color: data.color || "",
                    mileage: data.mileage?.toString() || "",
                    fuel: data.fuel || "",
                    transmission: data.transmission || "",
                    engineSize: data.engine_size?.toString() || "",
                    cylinders: data.cylinders?.toString() || "",
                    condition: data.condition || "",
                    accidents: data.accidents || "",
                    location: data.location || "",
                    vin: data.vin || "",
                    title: data.title || "",
                    description: data.description || "",
                    startBid: data.start_bid?.toString() || "",
                    reservePrice: data.reserve_price?.toString() || "",
                    auctionDuration: data.auction_duration?.toString() || "3",
                    features: Array.isArray(data.features) ? data.features : [],
                });

                if (data.images && Array.isArray(data.images)) {
                    setImages(data.images.map((img: any) => img.image));
                }

                if (data.inspection_report) {
                    setInspectionReport(data.inspection_report);
                }

            } catch (error) {
                console.error("Error fetching car details:", error);
                toast.error("حدث خطأ أثناء تحميل بيانات السيارة");
                navigate("/my-ads");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCarDetails();
    }, [id, navigate]);

    // Validation functions
    const validateYear = (year: string): string => {
        if (!year) return "";
        const yearNum = parseInt(year);
        if (isNaN(yearNum)) return "السنة يجب أن تكون رقماً";
        if (yearNum < 1886) return "السنة يجب أن تكون 1886 أو أحدث";
        if (yearNum > new Date().getFullYear() + 1) return `السنة يجب أن لا تتجاوز ${new Date().getFullYear() + 1}`;
        return "";
    };

    const validateModel = (model: string): string => {
        if (!model) return "";
        if (/^\d+$/.test(model)) return "اسم الموديل لا يمكن أن يكون أرقاماً فقط";
        if (!/^[a-zA-Z0-9\s\-\u0600-\u06FF]+$/.test(model)) return "اسم الموديل يحتوي على أحرف غير صالحة";
        return "";
    };

    const validateVIN = (vin: string): string => {
        if (!vin) return "";
        if (vin.length !== 17) return "رقم الهيكل يجب أن يكون 17 حرفاً بالضبط";
        if (/[IOQ]/i.test(vin)) return "رقم الهيكل لا يمكن أن يحتوي على الأحرف I أو O أو Q";
        if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return "رقم الهيكل يحتوي على أحرف غير صالحة";
        return "";
    };

    const validateMileage = (mileage: string): string => {
        if (!mileage) return "";
        const miles = parseInt(mileage);
        if (isNaN(miles)) return "المسافة يجب أن تكون رقماً";
        if (miles < 0) return "المسافة لا يمكن أن تكون سالبة";
        if (miles > 999999) return "المسافة غير منطقية (الحد الأقصى 999,999 كم)";
        return "";
    };

    const validateEngineSize = (size: string): string => {
        if (!size) return "";
        const engineSize = parseFloat(size);
        if (isNaN(engineSize)) return "سعة المحرك يجب أن تكون رقماً";
        if (engineSize < 0.6) return "سعة المحرك يجب أن تكون 0.6 لتر على الأقل";
        if (engineSize > 8.0) return "سعة المحرك غير منطقية (الحد الأقصى 8.0 لتر)";
        return "";
    };

    const validatePrice = (price: string): string => {
        if (!price) return "";
        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) return "السعر يجب أن يكون رقماً";
        if (priceNum <= 0) return "السعر يجب أن يكون أكبر من صفر";
        return "";
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Real-time validation
        let error = "";
        switch(field) {
            case "year": error = validateYear(value); break;
            case "model": error = validateModel(value); break;
            case "vin": error = validateVIN(value); break;
            case "mileage": error = validateMileage(value); break;
            case "engineSize": error = validateEngineSize(value); break;
            case "startBid": error = value ? validatePrice(value) : ""; break;
            case "reservePrice": error = value ? validatePrice(value) : ""; break;
        }
        
        setValidationErrors(prev => ({ ...prev, [field]: error }));
    };

    // Valid colors and cylinders
    const validColors = [
        "أسود", "أبيض", "فضي", "رمادي", "أحمر", "أزرق", "أخضر", "بني",
        "ذهبي", "برتقالي", "أصفر", "بيج", "أبيض لؤلؤي", "فضي معدني",
        "أسود مطفي", "أزرق غامق", "أخضر غامق", "رمادي داكن", "أحمر داكن", "برونزي"
    ];

    const validCylinders = ["2", "3", "4", "5", "6", "8", "10", "12", "16"];

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
        // Note: This logic only handles local state. Removing server-side images is complex.
        // For now, we'll just allow adding new ones and keep the UI clean.
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

        if (!formData.brand || !formData.model || !formData.year) {
            toast.error("يرجى ملء جميع الحقول الأساسية");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'features') {
                data.append(key, JSON.stringify(value));
            } else {
                data.append(key, value as string);
            }
        });

        data.set('start_bid', formData.startBid);
        data.set('reserve_price', formData.reservePrice);
        data.set('engine_size', formData.engineSize);
        data.set('auction_duration', formData.auctionDuration);

        // Append new images
        imageFiles.forEach((file) => {
            data.append('images', file);
        });

        // Append new inspection report if it's a File
        if (inspectionReport instanceof File) {
            data.append('inspection_report', inspectionReport);
        }

        try {
            await api.patch(`/cars/${id}/update/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("تم تحديث الإعلان بنجاح! سيتم مراجعته مجدداً");
            navigate("/my-ads");
        } catch (error: any) {
            console.error("Error updating car:", error);
            toast.error(error.response?.data?.error || "حدث خطأ أثناء تحديث الإعلان");
        } finally {
            setIsSubmitting(false);
        }
    };

    const carBrands = [
        "تويوتا", "مرسيدس", "BMW", "هوندا", "لكزس", "جيب",
        "نيسان", "هيونداي", "كيا", "شفروليه", "فورد", "مازدا"
    ];

    const fuelTypes = ["بنزين", "ديزل", "هايبرد", "كهربائي"];
    const transmissionTypes = ["أوتوماتيك", "مانيوال"];
    const conditionTypes = ["ممتازة", "جيدة جداً", "جيدة", "مقبولة"];
    const locations = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الخبر", "الطائف"];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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
                    <h1 className="mb-2 font-bold text-2xl">تعديل الإعلان</h1>
                    <p className="text-gray-600">قم بتحديث بيانات سيارتك</p>
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
                                يمكنك إضافة صور إضافية (بحد أقصى 20 صورة إجمالاً)
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
                                <div className="text-sm text-gray-500">
                                    ملاحظة: الصور الحالية تظهر أعلاه. أي صور جديدة يتم رفعها ستضاف للقائمة.
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
                        </CardHeader>
                        <CardContent>
                            {inspectionReport ? (
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3 text-green-700">
                                        <FileText className="w-8 h-8" />
                                        <div>
                                            <p className="font-medium">
                                                {inspectionReport instanceof File ? inspectionReport.name : "تم رفع التقرير مسبقاً"}
                                            </p>
                                            {inspectionReport instanceof File && (
                                                <p className="text-sm">{(inspectionReport.size / 1024).toFixed(2)} KB</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setInspectionReport(null)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="text-gray-700 font-medium mb-1">اضغط لإرفاق تقرير جديد</p>
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
                                    <Label htmlFor="reservePrice">السعر الاحتياطي (ريال)</Label>
                                    <Input
                                        id="reservePrice"
                                        type="number"
                                        placeholder="90000"
                                        value={formData.reservePrice}
                                        onChange={(e) => handleInputChange("reservePrice", e.target.value)}
                                        min={1}
                                        className={validationErrors.reservePrice ? "border-red-500" : ""}
                                    />
                                    {validationErrors.reservePrice && (
                                        <p className="text-sm text-red-500">{validationErrors.reservePrice}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        الحد الأدنى للسعر الذي ترغب في بيع السيارة به
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="auctionDuration">مدة المزاد *</Label>
                                    <Select value={formData.auctionDuration} onValueChange={(value: string) => handleInputChange("auctionDuration", value)}>
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
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            حفظ التعديلات
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
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
