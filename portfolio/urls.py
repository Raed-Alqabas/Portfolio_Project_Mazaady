from django.urls import path, include
from django.conf import settings
from . import views
from django.conf.urls.static import static
from .views import tap_return, tap_verify, pay_entry_fee

urlpatterns = [
    path('', views.index, name ='index'),
    path("auction/live-price/", views.auction_live_price, name="auction-live-price"),
    path("tap/return/", tap_return),
    path("tap/verify/", tap_verify),
    path("auctions/<int:auction_id>/pay-entry/", pay_entry_fee),    
]