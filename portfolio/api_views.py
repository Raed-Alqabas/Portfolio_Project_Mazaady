from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer, CarSerializer
from .models import CarImage
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from decimal import Decimal

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_api(request):
    print("DEBUG: register_api call received. Data:", request.data)
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        print("DEBUG: Register success for:", user.username)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    print("DEBUG: Register failed. Errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_api(request):
    print("DEBUG: login_api call received. Data:", request.data)
    
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        print("DEBUG: Login failed - missing credentials")
        return Response({'error': 'Please provide both username/email and password'}, status=400)

    # Check if login is by email
    if '@' in username:
        try:
            user_obj = User.objects.get(email=username)
            username = user_obj.username
        except User.DoesNotExist:
            print("DEBUG: Login failed - Email not found")
            pass
    
    user = authenticate(username=username, password=password)
    
    if not user:
        print("DEBUG: Login failed - Invalid Credentials")
        return Response({'error': 'Invalid Credentials'}, status=401)
        
    print("DEBUG: Login success for:", user.username)
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    try:
        print("DEBUG: logout_api call received")
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=205)
    except Exception as e:
        print("DEBUG: Logout failed:", e)
        return Response(status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_car_api(request):
    print("DEBUG: add_car_api call received. Files:", request.FILES)
    serializer = CarSerializer(data=request.data)
    if serializer.is_valid():
        car = serializer.save(user=request.user)
        
        # Handle multiple images
        images = request.FILES.getlist('images')
        for image in images:
            CarImage.objects.create(car=car, image=image)
            
        print("DEBUG: Car created successfully:", car.id)
        return Response(CarSerializer(car, context={'request': request}).data, status=201)
    
    print("DEBUG: Car creation failed. Errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_cars_api(request):
    from .models import Car
    cars = Car.objects.filter(user=request.user).order_by('-created_at')
    serializer = CarSerializer(cars, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_cars_api(request):
    from .models import Car
    cars = Car.objects.filter(status='ACTIVE').prefetch_related('images', 'bids').order_by('-created_at')
    serializer = CarSerializer(cars, many=True, context={'request': request})
    return Response(serializer.data)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_api(request, pk):
    from .models import Car
    try:
        car = Car.objects.get(pk=pk, user=request.user)
        if car.status == 'ACTIVE':
            return Response({'error': 'Cannot delete an active ad'}, status=400)
        car.delete()
        print(f"DEBUG: Car {pk} deleted successfully")
        return Response(status=204)
    except Car.DoesNotExist:
        print(f"DEBUG: Car {pk} not found for user {request.user}")
        return Response({'error': 'Car not found or unauthorized'}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_car_detail_api(request, pk):
    from .models import Car
    try:
        car = Car.objects.get(pk=pk, user=request.user)
        serializer = CarSerializer(car, context={'request': request})
        return Response(serializer.data)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or unauthorized'}, status=404)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_car_api(request, pk):
    from .models import Car
    try:
        car = Car.objects.get(pk=pk, user=request.user)
        if car.status == 'ACTIVE':
            return Response({'error': 'Cannot update an active ad'}, status=400)
        serializer = CarSerializer(car, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            # Reset status to IN_REVIEW whenever an update is made
            updated_car = serializer.save()
            
            # Handle new images if provided
            images = request.FILES.getlist('images')
            if images:
                # Optional: Decide whether to clear old images or append.
                # For now, let's append new images.
                for image in images:
                    CarImage.objects.create(car=updated_car, image=image)
            
            # Handle new inspection report if provided
            inspection_report = request.FILES.get('inspection_report')
            if inspection_report:
                updated_car.inspection_report = inspection_report
                updated_car.save()

            print(f"DEBUG: Car {pk} updated successfully")
            return Response(CarSerializer(updated_car, context={'request': request}).data)
        
        print(f"DEBUG: Car update failed. Errors: {serializer.errors}")
        return Response(serializer.errors, status=400)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or unauthorized'}, status=404)
    except Exception as e:
        print(f"DEBUG: Update failed:", e)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid_api(request, pk):
    from .models import Car, Bid
    
    # Check if user has bidding access (paid entry fee)
    try:
        profile = request.user.profile
        if not profile.bidding_access:
            return Response({
                'error': 'Payment required',
                'message': 'You must pay the 1500 SAR entry fee before bidding',
                'payment_required': True
            }, status=402)  # 402 Payment Required
    except Exception as e:
        return Response({
            'error': 'Profile not found',
            'message': 'Please complete your profile first',
            'payment_required': True
        }, status=402)
    
    try:
        car = Car.objects.get(pk=pk, status='ACTIVE')
        amount = request.data.get('amount')
        
        if not amount:
            return Response({'error': 'Amount is required'}, status=400)
            
        try:
            amount = Decimal(str(amount))
        except:
            return Response({'error': 'Invalid amount'}, status=400)
            
        if amount <= car.current_bid:
            return Response({'error': 'Bid must be higher than current price'}, status=400)
            
        Bid.objects.create(car=car, user=request.user, amount=amount)
        return Response({'message': 'Bid placed successfully'})
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or not active'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_car_detail_api(request, pk):
    from .models import Car
    from django.db.models import Q
    try:
        # Allow viewing if car is ACTIVE OR if the requester is the owner
        if request.user.is_authenticated:
            car = Car.objects.get(Q(pk=pk) & (Q(status='ACTIVE') | Q(user=request.user)))
        else:
            car = Car.objects.get(pk=pk, status='ACTIVE')
            
        serializer = CarSerializer(car, context={'request': request})
        return Response(serializer.data)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or not active'}, status=404)

# Favorites API endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorites_list_api(request):
    """List all favorites for the authenticated user"""
    from .models import Favorite
    favorites = Favorite.objects.filter(user=request.user).select_related('car').prefetch_related('car__images', 'car__bids')
    
    data = []
    for fav in favorites:
        car = fav.car
        data.append({
            'id': car.id,
            'title': f"{car.year} {car.brand} {car.model}",
            'currentBid': float(car.current_bid),
            'startingPrice': float(car.start_bid),
            'image': car.images.first().image.url if car.images.exists() else None,
            'status': car.status.lower(),
            'bids': car.bids_count,
            'location': car.location,
            'favorited_at': fav.created_at.isoformat(),
        })
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_favorite_api(request, pk):
    """Add a car to favorites"""
    from .models import Car, Favorite
    try:
        car = Car.objects.get(pk=pk)
        favorite, created = Favorite.objects.get_or_create(user=request.user, car=car)
        
        if created:
            return Response({'message': 'Added to favorites'}, status=201)
        else:
            return Response({'message': 'Already in favorites'}, status=200)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite_api(request, pk):
    """Remove a car from favorites"""
    from .models import Car, Favorite
    try:
        car = Car.objects.get(pk=pk)
        favorite = Favorite.objects.filter(user=request.user, car=car).first()
        
        if favorite:
            favorite.delete()
            return Response({'message': 'Removed from favorites'}, status=200)
        else:
            return Response({'error': 'Not in favorites'}, status=404)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorites_count_api(request):
    """Get count of favorites for notification badge"""
    from .models import Favorite
    count = Favorite.objects.filter(user=request.user).count()
    return Response({'count': count})

# My Bids API endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bids_api(request):
    """List all bids for the authenticated user"""
    from .models import Bid
    from django.db.models import Max
    
    user_bids = Bid.objects.filter(user=request.user).select_related('car').prefetch_related('car__images', 'car__bids')
    
    # Group bids by car
    cars_bid_on = {}
    for bid in user_bids:
        car_id = bid.car.id
        if car_id not in cars_bid_on:
            cars_bid_on[car_id] = {
                'car': bid.car,
                'my_bid': bid.amount,
                'bid_time': bid.created_at
            }
        else:
            # Keep track of highest bid
            if bid.amount > cars_bid_on[car_id]['my_bid']:
                cars_bid_on[car_id]['my_bid'] = bid.amount
                cars_bid_on[car_id]['bid_time'] = bid.created_at
    
    # Format response
    active_bids = []
    completed_bids = []
    
    for car_id, bid_info in cars_bid_on.items():
        car = bid_info['car']
        my_bid = bid_info['my_bid']
        current_bid = car.current_bid
        
        bid_data = {
            'id': car.id,
            'title': f"{car.year} {car.brand} {car.model}",
            'image': car.images.first().image.url if car.images.exists() else None,
            'myBid': float(my_bid),
            'currentBid': float(current_bid),
            'location': car.location,
        }
        
        if car.status == 'ACTIVE':
            # Determine if user is winning
            if float(my_bid) >= float(current_bid):
                bid_data['status'] = 'winning'
            else:
                bid_data['status'] = 'outbid'
            bid_data['timeLeft'] = 'حسب حالة السيارة'  # Placeholder, needs actual auction end time logic
            active_bids.append(bid_data)
        else:
            # Completed auction
            winner = car.winner
            if winner and winner.id == request.user.id:
                bid_data['status'] = 'won'
            else:
                bid_data['status'] = 'lost'
            bid_data['finalBid'] = float(current_bid)
            bid_data['endDate'] = 'منتهي'  # Placeholder
            completed_bids.append(bid_data)
    
    return Response({
        'active': active_bids,
        'completed': completed_bids
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bids_count_api(request):
    """Get count of active bids for notification badge"""
    from .models import Bid, Car
    
    # Count distinct cars with ACTIVE status that user has bid on
    active_cars_count = Bid.objects.filter(
        user=request.user,
        car__status='ACTIVE'
    ).values('car').distinct().count()
    
    return Response({'count': active_cars_count})

# Payment for Bidding Access
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pay_bidding_access_api(request):
    """One-time payment for global bidding access - 1500 SAR"""
    import os
    import requests
    
    # Get car_id from query parameter
    car_id = request.GET.get('car_id')
    
    # Check if user already has access
    try:
        from .models import Profile
        profile = request.user.profile
        if profile.bidding_access:
            return Response({'error': 'You already have bidding access'}, status=400)
    except:
        # Create profile if doesn't exist
        from .models import Profile
        profile = Profile.objects.create(
            user=request.user,
            phone_number="",
            phone_country_code="966"
        )
    
    # Fixed 1500 SAR entry fee
    from decimal import Decimal
    entry_amount = Decimal("1500.00")
    
    from .models import Payment, Car
    
    # Get car object if car_id provided
    car_obj = None
    if car_id:
        try:
            car_obj = Car.objects.get(id=car_id)
        except Car.DoesNotExist:
            pass
    
    payment = Payment.objects.create(
        user=request.user,
        auction=None,  # Global payment, not per auction
        car=car_obj,  # Store car for redirect
        purpose="BIDDING_ACCESS",
        amount=entry_amount,
        currency="SAR",
        status="INITIATED",
    )
    
    tap_url = "https://api.tap.company/v2/charges/"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": f"Bearer {os.getenv('TAP_SECRET_KEY')}",
    }
    
    base = "http://127.0.0.1:8000"
    
    # Get real user data from profile
    phone_number = profile.phone_number if profile.phone_number else "500000000"
    country_code = profile.phone_country_code if profile.phone_country_code else "966"
    
    # Clean phone number - remove any non-digits
    phone_number = ''.join(filter(str.isdigit, phone_number))
    
    payload = {
        "amount": float(payment.amount),
        "currency": payment.currency,
        "customer": {
            "first_name": request.user.first_name if request.user.first_name else request.user.username,
            "last_name": request.user.last_name if request.user.last_name else "",
            "email": request.user.email,
            "phone": {"country_code": country_code, "number": phone_number},
        },
        "source": {"id": "src_all"},
        "redirect": {"url": f"{base}/api/tap/return/?pid={payment.public_id}"},
        "post": {"url": f"{base}/api/tap/webhook/"},
        "reference": {"order": str(payment.public_id)},
    }
    
    r = requests.post(tap_url, json=payload, headers=headers)
    data = r.json()
    
    tap_charge_id = data.get("id")
    payment_url = data.get("transaction", {}).get("url")
    
    if not tap_charge_id or not payment_url:
        payment.status = "FAILED"
        payment.save(update_fields=["status"])
        return Response({'error': f"Tap error: {data}"}, status=400)
    
    payment.tap_charge_id = tap_charge_id
    payment.save(update_fields=["tap_charge_id"])
    
    return Response({'payment_url': payment_url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_api(request):
    """
    Get dashboard statistics and recent activity for authenticated user.
    Uses precise time-based logic to determine auction status.
    """
    from django.db.models import Sum, Q, Max
    from django.utils import timezone
    from datetime import timedelta
    from .models import Bid, Car, Favorite, Payment
    
    user = request.user
    now = timezone.now()
    
    # Pre-fetch all cars the user has interacted with (bid or won)
    user_bids = Bid.objects.filter(user=user).select_related('car')
    car_ids = user_bids.values_list('car', flat=True).distinct()
    cars = Car.objects.filter(id__in=car_ids).prefetch_related('bids', 'images')
    
    # Initialize Counters
    active_bids_count = 0
    won_count = 0
    total_spending = 0
    
    # Add Bidding Access Fees (Membership)
    membership_fees = Payment.objects.filter(
        user=user,
        status='CAPTURED',
        purpose='BIDDING_ACCESS'
    ).aggregate(total=Sum('amount'))['total']
    
    if membership_fees:
        total_spending += float(membership_fees)
    
    # Logic: It doesn't matter what car.status says, Time is the truth.
    for car in cars:
        auction_end = car.created_at + timedelta(days=car.auction_duration)
        is_ended = now >= auction_end
        
        # Get highest bid for this car
        highest_bid = car.bids.order_by('-amount').first()
        
        if not is_ended:
            # Auction is Active
            if car.status != 'CLOSED': # Double check just in case manually closed
                active_bids_count += 1
        else:
            # Auction Ended
            if highest_bid and highest_bid.user == user:
                won_count += 1
                total_spending += float(highest_bid.amount)
    
    # Favorites
    
    # Favorites
    favorites_count = Favorite.objects.filter(user=user).count()
    
    # 2. Recent Bids (Last 3 unique cars bid on)
    recent_bids_data = []
    
    # Get IDs of cars user bid on, ordered by most recent bid
    # Use annotate to get the latest bid time per car, then order by that
    recent_car_ids_ordered = Bid.objects.filter(user=user).values('car').annotate(
        latest_bid_time=Max('created_at')
    ).order_by('-latest_bid_time')[:5]
    
    # Extract just the IDs
    recent_car_ids = [item['car'] for item in recent_car_ids_ordered]
    
    for car_id in recent_car_ids:
        if len(recent_bids_data) >= 3:
            break
            
        # Find car in our pre-fetched list
        car = next((c for c in cars if c.id == car_id), None)
        if not car:
            continue
            
        auction_end = car.created_at + timedelta(days=car.auction_duration)
        is_ended = now >= auction_end
        
        highest_bid = car.bids.order_by('-amount').first()
        my_max_bid = car.bids.filter(user=user).aggregate(Max('amount'))['amount__max']
        
        # Determine Status for Display
        if is_ended:
            if highest_bid and highest_bid.user == user:
                status = 'won'
                timeLeft = 'منتهي (فائز)'
            else:
                status = 'outbid' # or 'lost'
                timeLeft = 'منتهي'
        else:
            if highest_bid and highest_bid.user == user:
                status = 'active'
            else:
                status = 'outbid'
                
            # Time Left String
            time_diff = auction_end - now
            if time_diff.days > 0:
                timeLeft = f'{time_diff.days} أيام'
            elif time_diff.seconds // 3600 > 0:
                timeLeft = f'{time_diff.seconds // 3600} ساعات'
            else:
                timeLeft = f'{(time_diff.seconds // 60) % 60} دقائق'
                
        image_url = None
        if car.images.exists():
            image_url = request.build_absolute_uri(car.images.first().image.url)
            
        recent_bids_data.append({
            'id': car.id,
            'title': car.title,
            'currentBid': float(highest_bid.amount) if highest_bid else float(car.start_bid),
            'myBid': float(my_max_bid) if my_max_bid else 0,
            'timeLeft': timeLeft,
            'status': status,
            'image': image_url
        })

    # Recent Activity Flow
    final_activity = []
    
    # 1. Bids
    last_bids = Bid.objects.filter(user=user).select_related('car').order_by('-created_at')[:5]
    for bid in last_bids:
        final_activity.append({
            'type': 'bid',
            'timestamp': bid.created_at,
            'message': f'قمت بالمزايدة على {bid.car.title}',
            'amount': f'{int(bid.amount):,} ريال'
        })
        
    # 2. Favorites
    last_favs = Favorite.objects.filter(user=user).select_related('car').order_by('-created_at')[:5]
    for fav in last_favs:
        final_activity.append({
            'type': 'favorite',
            'timestamp': fav.created_at,
            'message': f'أضفت {fav.car.title} للمفضلة',
            'amount': None
        })
        
    # Sort and slice
    final_activity.sort(key=lambda x: x['timestamp'], reverse=True)
    final_activity = final_activity[:5]
    
    # Format Time
    formatted_activity = []
    for item in final_activity:
        time_diff = now - item['timestamp']
        if time_diff.days > 0:
            time_str = f'منذ {time_diff.days} يوم'
        elif time_diff.seconds // 3600 > 0:
            time_str = f'منذ {time_diff.seconds // 3600} ساعة'
        else:
            mins = time_diff.seconds // 60
            time_str = 'الآن' if mins < 1 else f'منذ {mins} دقيقة'

        formatted_activity.append({
            'type': item['type'],
            'message': item['message'],
            'time': time_str,
            'amount': item['amount']
        })

    
    # Active Ads
    active_ads_count = Car.objects.filter(user=user, status='ACTIVE').count()
    
    # Rating
    rating = None
    if hasattr(user, 'profile'):
        rating = user.profile.rating

    return Response({
        'stats': {
            'activeBids': active_bids_count,
            'wonAuctions': won_count,
            'favorites': favorites_count,
            'totalSpending': total_spending,
            'activeAds': active_ads_count,
            'rating': rating
        },
        'recentBids': recent_bids_data,
        'recentActivity': formatted_activity
    })

# User Info Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_api(request):
    """Get current user information"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    phone = ''
    if profile:
        phone = profile.phone_number
        
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': phone,
        'date_joined': user.date_joined
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_api(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'كلمة المرور الحالية غير صحيحة'}, status=400)
        
    user.set_password(new_password)
    user.save()
    return Response({'message': 'تم تغيير كلمة المرور بنجاح'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile_api(request):
    """Update user profile info"""
    user = request.user
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.save()
    
    # Update phone if provided
    phone = request.data.get('phone')
    if phone and hasattr(user, 'profile'):
        user.profile.phone_number = phone
        user.profile.save()
        
    return Response({'message': 'تم تحديث البيانات بنجاح'})


# Notifications API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_api(request):
    """Get user notifications"""
    from .models import Notification
    user = request.user
    notifications = Notification.objects.filter(user=user)[:50]  # Last 50 notifications
    
    data = []
    for notif in notifications:
        data.append({
            'id': notif.id,
            'type': notif.notification_type,
            'title': notif.title,
            'message': notif.message,
            'link': notif.link,
            'is_read': notif.is_read,
            'created_at': notif.created_at
        })
    
    return Response({'notifications': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_count_api(request):
    """Get unread notifications count"""
    from .models import Notification
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read_api(request, notification_id):
    """Mark a notification as read"""
    from .models import Notification
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'تم وضع علامة مقروء'})
    except Notification.DoesNotExist:
        return Response({'error': 'الإشعار غير موجود'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read_api(request):
    """Mark all user notifications as read"""
    from .models import Notification
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'تم وضع علامة مقروء على جميع الإشعارات'})

