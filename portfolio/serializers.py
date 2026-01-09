from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Car, CarImage, Bid, Favorite


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

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'created_at']


class MaskedBidSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    user_masked_id = serializers.CharField(source='user.profile.masked_id', read_only=True)
    is_mine = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = ['id', 'username', 'user_masked_id', 'amount', 'created_at', 'is_mine', 'rank']

    def get_username(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.user:
            return obj.user.username
        return "..."

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user

    def get_rank(self, obj):
        # Calculate rank among all bids for this car
        bids = Bid.objects.filter(car=obj.car).order_by('-amount')
        for i, bid in enumerate(bids):
            if bid.id == obj.id:
                return i + 1
        return None

class AuctionDetailSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    bids = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    top_bidders_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'user', 'title', 'brand', 'model', 'year', 'color', 'location',
            'description', 'mileage', 'fuel', 'transmission', 'engine_size',
            'cylinders', 'condition', 'vin', 'accidents', 'start_bid',
            'reserve_price', 'auction_duration', 'inspection_report',
            'features', 'images', 'status', 'created_at', 'updated_at',
            'is_favorited', 'bids', 'top_bidders_count'
        ]

    def get_bids(self, obj):
        # Get latest 10 bids
        bids = obj.bids.all()[:10]
        return MaskedBidSerializer(bids, many=True, context=self.context).data

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car=obj).exists()
        return False
        
    def get_top_bidders_count(self, obj):
        return obj.bids.values('user').distinct().count()

class CarSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    latest_bid = serializers.SerializerMethodField()
    bids_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = [
            'id', 'user', 'title', 'brand', 'model', 'year', 'color', 'location',
            'description', 'mileage', 'fuel', 'transmission', 'engine_size',
            'cylinders', 'condition', 'vin', 'accidents', 'start_bid',
            'reserve_price', 'auction_duration', 'inspection_report',
            'features', 'images', 'status', 'created_at', 'updated_at',
            'is_favorited', 'latest_bid', 'bids_count'
        ]
        read_only_fields = ['user', 'status']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car=obj).exists()
        return False
        
    def get_latest_bid(self, obj):
        first_bid = obj.bids.first()
        return first_bid.amount if first_bid else None

    def get_bids_count(self, obj):
        return obj.bids.count()


