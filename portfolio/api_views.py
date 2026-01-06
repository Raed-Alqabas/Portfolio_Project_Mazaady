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
        return Response(CarSerializer(car).data, status=201)
    
    print("DEBUG: Car creation failed. Errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_cars_api(request):
    from .models import Car
    cars = Car.objects.filter(user=request.user).order_by('-created_at')
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_cars_api(request):
    from .models import Car
    cars = Car.objects.filter(status='ACTIVE').order_by('-created_at')
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)

