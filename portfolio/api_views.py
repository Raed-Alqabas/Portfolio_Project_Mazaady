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
    
    # Sync Django session with this user to prevent "revert to previous session user"
    from django.contrib.auth import login
    login(request, user)
    
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
        
        # Clear Django session just in case
        from django.contrib.auth import logout
        logout(request)
        
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
        return Response(CarSerializer(car).data, status=201)
    
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
    cars = Car.objects.filter(status='ACTIVE').order_by('-created_at')
    serializer = CarSerializer(cars, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_api(request):
    """Get or update user profile"""
    from .models import Profile
    
    if request.method == 'GET':
        user = request.user
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user, phone_number="")
        
        return Response({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'email': user.email,
            'phone': profile.phone_number,
            'phone_country_code': profile.phone_country_code,
            'bidding_access': profile.bidding_access,
            'date_joined': user.date_joined.isoformat(),
        })
    
    elif request.method == 'PUT':
        user = request.user
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user, phone_number="")
        
        # Update user fields
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        username = request.data.get('username', user.username)
        email = request.data.get('email', user.email)
        
        # Check username uniqueness
        if username != user.username and User.objects.filter(username=username).exists():
            return Response({'error': 'اسم المستخدم مستخدم بالفعل'}, status=400)
        
        # Check email uniqueness
        if email != user.email and User.objects.filter(email=email).exists():
            return Response({'error': 'البريد الإلكتروني مستخدم بالفعل'}, status=400)
        
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.email = email
        user.save()
        
        # Update profile fields
        phone = request.data.get('phone', profile.phone_number)
        profile.phone_number = phone
        profile.save()
        
        return Response({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'email': user.email,
            'phone': profile.phone_number,
            'phone_country_code': profile.phone_country_code,
            'bidding_access': profile.bidding_access,
            'date_joined': user.date_joined.isoformat(),
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_api(request):
    """Change user password"""
    from django.contrib.auth import authenticate
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not old_password or not new_password or not confirm_password:
        return Response({'error': 'جميع الحقول مطلوبة'}, status=400)
    
    # Verify old password
    user = authenticate(username=request.user.username, password=old_password)
    if not user:
        return Response({'error': 'كلمة المرور الحالية غير صحيحة'}, status=400)
    
    # Verify new password confirmation
    if new_password != confirm_password:
        return Response({'error': 'كلمة المرور الجديدة غير متطابقة'}, status=400)
    
    # Password validation
    if len(new_password) < 6:
        return Response({'error': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'}, status=400)
    
    # Change password
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'message': 'تم تغيير كلمة المرور بنجاح'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats_api(request):
    """Get user statistics for profile page"""
    from .models import Car, Bid
    
    user = request.user
    
    # Active Listings
    active_listings = Car.objects.filter(user=user, status='ACTIVE').count()
    
    # Active Bids (distinct cars)
    active_bids = Car.objects.filter(
        bids__user=user, 
        status='ACTIVE'
    ).distinct().count()
    
    # Completed Bids (won auctions)
    # Simplified: cars where user bid and status is not active (closed/sold)
    completed_bids = Car.objects.filter(
        bids__user=user
    ).exclude(status='ACTIVE').distinct().count()
    
    # Rating (placeholder)
    rating = 4.8 
    
    return Response({
        'active_bids': active_bids,
        'completed_bids': completed_bids,
        'active_listings': active_listings,
        'rating': rating,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_api(request):
    """Get dashboard statistics and activity"""
    from .models import Car, Bid, Favorite, Payment
    from django.db.models import Sum
    from django.utils import timezone
    
    user = request.user
    
    # 1. Stats
    active_bids_count = Car.objects.filter(
        bids__user=user, 
        status='ACTIVE'
    ).distinct().count()
    
    won_auctions_count = Car.objects.filter(
        bids__user=user,
        status='SOLD' # placeholder status
    ).distinct().count()
    
    favorites_count = Favorite.objects.filter(user=user).count()
    
    total_spending = Payment.objects.filter(
        user=user, 
        status='CAPTURED'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    stats = {
        'active_bids': active_bids_count,
        'won_auctions': won_auctions_count,
        'favorites': favorites_count,
        'total_spending': total_spending,
    }
    
    # 2. Recent Bids
    recent_bids_objs = Bid.objects.filter(user=user).select_related('car').order_by('-created_at')[:5]
    recent_bids = []
    
    for bid in recent_bids_objs:
        car = bid.car
        # Time left logic
        now = timezone.now()
        end_time = car.created_at + timezone.timedelta(days=car.auction_duration)
        delta = end_time - now
        
        if delta.total_seconds() <= 0:
            time_left = "منتهي"
        elif delta.days > 0:
            time_left = f"{delta.days} يوم"
        elif delta.seconds >= 3600:
            time_left = f"{delta.seconds // 3600} ساعة"
        else:
            time_left = f"{delta.seconds // 60} دقيقة"

        # Bidding status logic
        highest_bid = car.bids.order_by('-amount').first()
        current_bid_amount = highest_bid.amount if highest_bid else car.start_bid
        
        status = 'active'
        if time_left == "منتهي":
             # Identify if won
            if highest_bid and highest_bid.user == user:
                 status = 'won'
            else:
                 status = 'ended'
        elif highest_bid and highest_bid.user != user:
            status = 'outbid'

        # Get Car Image safely
        first_img = car.images.first()
        img_url = first_img.image.url if first_img else None

        recent_bids.append({
            'id': car.id,
            'title': car.title,
            'currentBid': float(current_bid_amount),
            'myBid': float(bid.amount),
            'timeLeft': time_left,
            'status': status,
            'image': request.build_absolute_uri(img_url) if img_url else None
        })
        
    # 3. Recent Activity (Merging Bids + Favorites)
    recent_activity = []
    
    # Bids
    last_bids = Bid.objects.filter(user=user).select_related('car').order_by('-created_at')[:5]
    for b in last_bids:
        recent_activity.append({
            'type': 'bid',
            'message': f"قمت بالمزايدة على {b.car.title}",
            'time': b.created_at, # Frontend will format relative time
            'amount': f"{b.amount} ريال",
            'timestamp': b.created_at.timestamp()
        })
        
    # Favorites
    last_favs = Favorite.objects.filter(user=user).select_related('car').order_by('-created_at')[:5]
    for f in last_favs:
        recent_activity.append({
            'type': 'favorite',
            'message': f"أضفت {f.car.title} للمفضلة",
            'time': f.created_at,
            'amount': None,
            'timestamp': f.created_at.timestamp()
        })
        
    # Sort and slice
    recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activity = recent_activity[:5]
    
    return Response({
        'stats': stats,
        'recent_bids': recent_bids,
        'recent_activity': recent_activity
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorites_list_api(request):
    """Get user favorites"""
    from .models import Favorite
    from django.utils import timezone

    favorites = Favorite.objects.filter(user=request.user).select_related('car').order_by('-created_at')
    data = []
    
    for fav in favorites:
        car = fav.car
        
        # Determine status/time
        now = timezone.now()
        end_time = car.created_at + timezone.timedelta(days=car.auction_duration)
        delta = end_time - now
        
        if delta.total_seconds() <= 0:
            status = 'ended'
            time_text = "منتهي"
        elif delta.total_seconds() < 3600: # Less than 1 hour
            status = 'ending-soon'
            time_text = f"{delta.seconds // 60} دقيقة"
        else:
            status = 'active'
            time_text = f"{delta.days} يوم" if delta.days > 0 else f"{delta.seconds // 3600} ساعة"

        # Bids info
        highest_bid_obj = car.bids.order_by('-amount').first()
        current_bid = highest_bid_obj.amount if highest_bid_obj else car.start_bid
        bids_count = car.bids.count()
        
        first_img = car.images.first()
        img_url = first_img.image.url if first_img else None

        data.append({
            'id': car.id,
            'title': car.title,
            'currentBid': float(current_bid),
            'startingPrice': float(car.start_bid),
            'endTime': time_text,
            'image': request.build_absolute_uri(img_url) if img_url else None,
            'status': status,
            'bids': bids_count,
            'location': car.location, 
        })
        
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_api(request):
    """Toggle favorite status for a car"""
    from .models import Favorite, Car
    car_id = request.data.get('car_id')
    
    if not car_id:
        return Response({'error': 'car_id required'}, status=400)
        
    try:
        car = Car.objects.get(id=car_id)
        obj, created = Favorite.objects.get_or_create(user=request.user, car=car)
        
        if not created:
            # Already existed, so remove it
            obj.delete()
            return Response({'status': 'removed', 'message': 'تم الإزالة من المفضلة'})
        else:
            return Response({'status': 'added', 'message': 'تم الإضافة للمفضلة'})
            
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def auction_details_api(request, car_id):
    """Get full auction details with masked bidding history"""
    from .models import Car
    from .serializers import AuctionDetailSerializer
    
    try:
        car = Car.objects.get(id=car_id)
        serializer = AuctionDetailSerializer(car, context={'request': request})
        return Response(serializer.data)
    except Car.DoesNotExist:
        return Response({'error': 'Auction not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_bid_api(request, car_id):
    """Place a bid with concurrency protection"""
    from django.db import transaction
    from .models import Car, Bid
    from decimal import Decimal
    
    amount_str = request.data.get('amount')
    if not amount_str:
        return Response({'error': 'يجب إدخال مبلغ المزايدة'}, status=400)
    
    try:
        amount = Decimal(amount_str)
    except:
        return Response({'error': 'مبلغ غير صحيح'}, status=400)

    # Check bidding access
    if not hasattr(request.user, 'profile') or not request.user.profile.bidding_access:
        return Response({'error': 'ACCESS_DENIED', 'message': 'يجب دفع تأمين المزايدة أولاً'}, status=403)

    with transaction.atomic():
        # Lock the car row for update
        try:
            car = Car.objects.select_for_update().get(id=car_id)
        except Car.DoesNotExist:
            return Response({'error': 'المزاد غير موجود'}, status=404)

        if car.status != 'ACTIVE':
            return Response({'error': 'المزاد منتهي'}, status=400)

        # Get current highest bid
        highest_bid = car.bids.order_by('-amount').first()
        current_price = highest_bid.amount if highest_bid else car.start_bid
        
        min_increment = Decimal('1000.00') # Hardcoded as in frontend mock for now
        
        if amount <= current_price:
            return Response({'error': 'يجب أن يكون مبلغ المزايدة أكبر من السعر الحالي'}, status=400)
        
        if amount < current_price + min_increment:
            return Response({'error': f'الحد الأدنى للزيادة هو {min_increment} ريال'}, status=400)

        # Create the bid
        Bid.objects.create(
            user=request.user,
            car=car,
            amount=amount
        )
        
        return Response({'message': 'تم تقديم المزايدة بنجاح', 'current_price': float(amount)})


