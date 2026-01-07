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
    cars = Car.objects.filter(status='ACTIVE').order_by('-created_at')
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
