from django.urls import path, include
from django.conf import settings
from . import views, api_views
from .views import test_api
from django.conf.urls.static import static
from .views import tap_return, tap_verify

urlpatterns = [
    path('', views.index, name ='index'),
    path("test/", test_api),
    path("auction/live-price/", views.auction_live_price, name="auction-live-price"),
    path("tap/return/", tap_return),
    path("tap/verify/", tap_verify),
    path("pay-bidding-access/", api_views.pay_bidding_access_api, name="pay-bidding-access"),
    
    # Auth API endpoints
    path('auth/login/', api_views.login_api, name='api-login'),
    path('auth/register/', api_views.register_api, name='api-register'),
    path('auth/logout/', api_views.logout_api, name='api-logout'),
    path('auth/me/', api_views.me_api, name='api-me'),
    path('auth/change-password/', api_views.change_password_api, name='api-change-password'),
    path('auth/update-profile/', api_views.update_profile_api, name='api-update-profile'),
    
    # Car API endpoints
    path('cars/add/', api_views.add_car_api, name='api-add-car'),
    path('cars/my/', api_views.my_cars_api, name='api-my-cars'),
    path('cars/public/', api_views.public_cars_api, name='api-public-cars'),
    path('cars/<int:pk>/delete/', api_views.delete_car_api, name='api-delete-car'),
    path('cars/public/<int:pk>/', api_views.public_car_detail_api, name='api-public-car-detail'),
    path('cars/<int:pk>/bid/', api_views.place_bid_api, name='api-car-place-bid'),
    path('cars/<int:pk>/', api_views.get_car_detail_api, name='api-car-detail'),
    path('cars/<int:pk>/update/', api_views.update_car_api, name='api-update-car'),
    
    # Favorites API endpoints
    path('favorites/', api_views.favorites_list_api, name='api-favorites-list'),
    path('favorites/<int:pk>/add/', api_views.add_favorite_api, name='api-add-favorite'),
    path('favorites/<int:pk>/remove/', api_views.remove_favorite_api, name='api-remove-favorite'),
    path('favorites/count/', api_views.favorites_count_api, name='api-favorites-count'),
    
    # My Bids API endpoints
    path('my-bids/', api_views.my_bids_api, name='api-my-bids'),
    path('my-bids/count/', api_views.my_bids_count_api, name='api-my-bids-count'),
    
    # Dashboard
    path('dashboard/', api_views.dashboard_api, name='api-dashboard'),
    
    # Notifications
    path('notifications/', api_views.notifications_api, name='api-notifications'),
    path('notifications/count/', api_views.notifications_count_api, name='api-notifications-count'),
    path('notifications/<int:notification_id>/read/', api_views.mark_notification_read_api, name='api-mark-notification-read'),
    path('notifications/mark-all-read/', api_views.mark_all_notifications_read_api, name='api-mark-all-notifications-read'),
    
    # Admin Dashboard
    path('admin/dashboard/', api_views.admin_dashboard_api, name='api-admin-dashboard'),
    
    # Contact Us
    path('contact/', api_views.contact_us_api, name='api-contact'),
]