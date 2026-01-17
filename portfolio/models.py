from django.db import models
from decimal import Decimal
from django.contrib.auth.models import User
import uuid
from django.conf import settings


# Create your models here.
class Mazaady(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    status = models.CharField(
        max_length=10,
        choices=[("OPEN", "Open"), ("CLOSED", "Closed")],
        default="OPEN"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "mazaady"   # keep table name stable across databases


    def __str__(self):
        return self.title

class Payment(models.Model):
    PURPOSE_CHOICES = [
        ("ENTRY_FEE", "Entry Fee"),
        ("FINAL_CHARGE", "Final Charge"),
        ("BIDDING_ACCESS", "Bidding Access"),  # One-time global payment
    ]

    STATUS_CHOICES = [
        ("INITIATED", "Initiated"),
        ("CAPTURED", "Captured"),
        ("FAILED", "Failed"),
        ("UNKNOWN", "Unknown"),
    ]

    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    auction = models.ForeignKey("Mazaady", on_delete=models.CASCADE, null=True, blank=True)
    car = models.ForeignKey("Car", on_delete=models.SET_NULL, null=True, blank=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="SAR")

    tap_charge_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="INITIATED")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AuctionEntry(models.Model):
    auction = models.ForeignKey("Mazaady", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("auction", "user")


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone_country_code = models.CharField(max_length=5, default="966")
    phone_number = models.CharField(max_length=20)
    bidding_access = models.BooleanField(default=False)
    masked_id = models.CharField(max_length=20, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

class Car(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars')
    
    # Basic Info
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    
    # Description
    description = models.TextField()
    
    # Technical Details
    mileage = models.IntegerField()
    fuel = models.CharField(max_length=50)
    transmission = models.CharField(max_length=50)
    engine_size = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    cylinders = models.IntegerField(null=True, blank=True)
    
    # Condition
    condition = models.CharField(max_length=50)
    vin = models.CharField(max_length=100, null=True, blank=True)
    accidents = models.CharField(max_length=100)
    
    # Auction Details
    start_bid = models.DecimalField(max_digits=12, decimal_places=2)
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    auction_duration = models.IntegerField(default=3)
    
    # Files
    inspection_report = models.FileField(upload_to='inspection_reports/', null=True, blank=True)
    
    # Meta or Extra
    features = models.JSONField(default=list, blank=True)
    
    # Auction Result
    # Auction Result
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_cars')
    
    STATUS_CHOICES = [
        ('IN_REVIEW', 'In Review'),
        ('SOON', 'Soon'),
        ('ACTIVE', 'Active'),
        ('REJECTED', 'Rejected'),
        ('CLOSED', 'Closed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_REVIEW')
    
    start_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def current_bid(self):
        last_bid = self.bids.order_by('-amount').first()
        return last_bid.amount if last_bid else self.start_bid

    @property
    def bids_count(self):
        return self.bids.count()

    @property
    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        
        if self.status == 'CLOSED':
            return True
            
        base_time = self.start_date if self.start_date else self.created_at
        expiration_time = base_time + timedelta(minutes=self.auction_duration)
        return timezone.now() >= expiration_time

    def check_status(self):
        """Updates status to CLOSED if auction has expired"""
        if self.status == 'ACTIVE' and self.is_expired:
            self.status = 'CLOSED'
            
            # Find and set winner
            highest_bid = self.bids.order_by('-amount').first()
            if highest_bid:
                self.winner = highest_bid.user
                
            self.save(update_fields=['status', 'winner'])
            return True
        return False

    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"

class CarImage(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='car_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.car}"

class Bid(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bids')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-amount']

    def __str__(self):
        return f"{self.user.username} - {self.amount} on {self.car}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('OUTBID', 'تم تجاوز عرضك'),
        ('AUCTION_ENDING', 'المزاد ينتهي قريباً'),
        ('AUCTION_WON', 'فزت بالمزاد'),
        ('NEW_BID', 'عرض جديد على سيارتك'),
        ('AUCTION_ENDED', 'انتهى المزاد'),
        ('PAYMENT_CONFIRMED', 'تم تأكيد الدفع'),
        ('SYSTEM', 'إشعار النظام'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=200, blank=True, null=True)  # URL to redirect to
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.car.title}"
