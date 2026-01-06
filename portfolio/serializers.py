from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True)
    phone_country_code = serializers.CharField(write_only=True, required=False, default="966")
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "phone_country_code", "phone_number")
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مستخدم بالفعل")
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number")
        phone_country_code = validated_data.pop("phone_country_code", "966")

        user = User.objects.create_user(**validated_data)

        Profile.objects.create(
            user=user,
            phone_country_code=phone_country_code,
            phone_number=phone_number,
        )
        return user