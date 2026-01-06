from django.urls import path, include
from django.conf import settings
from . import views, api_views
from .views import test_api
from django.conf.urls.static import static
from .views import tap_return, tap_verify, pay_entry_fee

urlpatterns = [
    path('', views.index, name ='index'),
    path("test/", test_api),
    path("auction/live-price/", views.auction_live_price, name="auction-live-price"),
    path("tap/return/", tap_return),
    path("tap/verify/", tap_verify),
    path("auctions/<int:auction_id>/pay-entry/", pay_entry_fee),    
    
    # Auth API endpoints
    path('auth/login/', api_views.login_api, name='api-login'),
    path('auth/register/', api_views.register_api, name='api-register'),
    path('auth/logout/', api_views.logout_api, name='api-logout'),
    
    # Car API endpoints
    path('cars/add/', api_views.add_car_api, name='api-add-car'),
    path('cars/my/', api_views.my_cars_api, name='api-my-cars'),
    path('cars/public/', api_views.public_cars_api, name='api-public-cars'),
]