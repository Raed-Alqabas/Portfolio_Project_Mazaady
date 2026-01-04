from django.contrib import admin
from .models import Mazaady

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