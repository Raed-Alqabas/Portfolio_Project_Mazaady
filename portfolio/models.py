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
    ]

    STATUS_CHOICES = [
        ("INITIATED", "Initiated"),
        ("CAPTURED", "Captured"),
        ("FAILED", "Failed"),
        ("UNKNOWN", "Unknown"),
    ]

    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    auction = models.ForeignKey("Mazaady", on_delete=models.CASCADE)

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
    
    STATUS_CHOICES = [
        ('IN_REVIEW', 'In Review'),
        ('ACTIVE', 'Active'),
        ('REJECTED', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def current_bid(self):
        last_bid = self.bids.order_by('-amount').first()
        return last_bid.amount if last_bid else self.start_bid

    @property
    def bids_count(self):
        return self.bids.count()

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
