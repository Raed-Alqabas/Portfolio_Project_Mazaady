from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q


class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login with either username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None
        
        try:
            # Try to find user by username or email
            user = User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # If multiple users found, try exact username match first
            user = User.objects.filter(username=username).first()
            if not user:
                return None
        
        # Check password
        if user.check_password(password):
            return user
        
        return None
