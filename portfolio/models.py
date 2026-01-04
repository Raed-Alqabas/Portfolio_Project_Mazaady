from django.db import models
from decimal import Decimal
import uuid

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
        db_table = "mazaady"   # forces EXACT table name in MySQL

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

    payer_email = models.EmailField()
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="SAR")

    tap_charge_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="INITIATED")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AuctionEntry(models.Model):
    auction = models.ForeignKey("Mazaady", on_delete=models.CASCADE)
    payer_email = models.EmailField()
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("auction", "payer_email")