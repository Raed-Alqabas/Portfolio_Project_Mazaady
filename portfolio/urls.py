from django.urls import path, include
from django.conf import settings
from . import views, api_views
from .views import test_api
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name ='index'),
    path("test/", test_api),
    path("auction/live-price/", views.auction_live_price, name="auction-live-price"),
    
    # Auth API endpoints
    path('auth/login/', api_views.login_api, name='api-login'),
    path('auth/register/', api_views.register_api, name='api-register'),
    path('auth/logout/', api_views.logout_api, name='api-logout'),
]