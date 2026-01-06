from django.contrib import admin
from .models import Mazaady, UserProfile, Car, CarImage

# Register your models here.

@admin.register(Mazaady)
class MazaadyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "starting_price",
        "current_price",
        "status",
        "created_at",
    )
    search_fields = ("title",)
    list_filter = ("status",)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")
    search_fields = ("user__username", "phone")

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "brand", "model", "year", "start_bid", "created_at")
    search_fields = ("title", "brand", "model", "user__username")
    list_filter = ("brand", "year", "location")
    inlines = [CarImageInline]

@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ("id", "car", "created_at")
