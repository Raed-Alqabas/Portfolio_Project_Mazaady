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

# User Info Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_api(request):
    """Get current user information"""
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
    })
