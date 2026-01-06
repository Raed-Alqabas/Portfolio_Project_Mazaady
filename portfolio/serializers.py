from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Car, CarImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'email', 'password', 'phone')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }
    
    phone = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if phone:
            from .models import UserProfile
            UserProfile.objects.create(user=user, phone=phone)
        return user

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'created_at']

class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = [
            'id', 'user', 'title', 'brand', 'model', 'year', 'color', 'location',
            'description', 'mileage', 'fuel', 'transmission', 'engine_size',
            'cylinders', 'condition', 'vin', 'accidents', 'start_bid',
            'reserve_price', 'auction_duration', 'inspection_report',
            'features', 'images', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status']


