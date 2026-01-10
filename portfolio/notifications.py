from django.db import models
from django.contrib.auth.models import User

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
