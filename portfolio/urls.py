from django.urls import path, include
from django.conf import settings
from . import views, api_views
from .views import test_api
from django.conf.urls.static import static
from .views import tap_return, tap_verify, pay_membership, tap_webhook

urlpatterns = [
    path('', views.index, name ='index'),
    path("test/", test_api),
    path("auction/live-price/", views.auction_live_price, name="auction-live-price"),
    path("tap/return/", tap_return),
    path("tap/webhook/", tap_webhook),
    path("tap/verify/", tap_verify),
    path("membership/pay/", pay_membership, name="pay-membership"),    
    
    # Auth API endpoints
    path('auth/login/', api_views.login_api, name='api-login'),
    path('auth/register/', api_views.register_api, name='api-register'),
    path('auth/logout/', api_views.logout_api, name='api-logout'),
    path('auth/profile/', api_views.profile_api, name='api-profile'),
    path('auth/change-password/', api_views.change_password_api, name='api-change-password'),
    path('auth/stats/', api_views.user_stats_api, name='api-user-stats'),
    
    # Dashboard & Favorites
    path('dashboard/stats/', api_views.dashboard_stats_api, name='api-dashboard-stats'),
    path('favorites/', api_views.favorites_list_api, name='api-favorites-list'),
    path('favorites/toggle/', api_views.toggle_favorite_api, name='api-toggle-favorite'),

    # Car API endpoints
    path('cars/add/', api_views.add_car_api, name='api-add-car'),
    path('cars/my/', api_views.my_cars_api, name='api-my-cars'),
    path('cars/public/', api_views.public_cars_api, name='api-public-cars'),

    # Auction & Bidding
    path('auctions/<int:car_id>/', api_views.auction_details_api, name='api-auction-details'),
    path('auctions/<int:car_id>/bid/', api_views.place_bid_api, name='api-place-bid'),
]