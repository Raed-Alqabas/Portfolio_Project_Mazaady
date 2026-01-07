from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Car, CarImage, Bid


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class RegisterSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_blank=True)
    phone_country_code = serializers.CharField(required=False, default="966")
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'email', 'password', 'phone', 'phone_country_code')
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', None)
        phone_country_code = validated_data.pop('phone_country_code', '966')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        from .models import Profile
        Profile.objects.create(
            user=user, 
            phone_number=phone if phone else "",
            phone_country_code=phone_country_code
        )
        return user

class BidSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    time = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = ['user', 'amount', 'time']

    def get_time(self, obj):
        from django.utils.timesince import timesince
        from django.utils import timezone
        return timesince(obj.created_at, timezone.now()) + " ago"

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'created_at']

class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    recent_bids = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'user', 'title', 'brand', 'model', 'year', 'color', 'location',
            'description', 'mileage', 'fuel', 'transmission', 'engine_size',
            'cylinders', 'condition', 'vin', 'accidents', 'start_bid',
            'reserve_price', 'auction_duration', 'inspection_report',
            'features', 'images', 'status', 'current_bid', 'bids_count',
            'recent_bids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'current_bid', 'bids_count', 'recent_bids']

    def get_recent_bids(self, obj):
        bids = obj.bids.all()[:10]
        return BidSerializer(bids, many=True).data


