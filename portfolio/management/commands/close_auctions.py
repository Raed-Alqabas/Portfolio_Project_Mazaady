from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from portfolio.models import Car, Bid
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Closes expired auctions and notifies winners'

    def handle(self, *args, **options):
        now = timezone.now()
        # Find active cars that have expired
        # We need to filter where created_at + auction_duration (days) < now
        # Since we can't do arithmetic in filter easily for all DBs, we'll iterate or use annotation if needed.
        # For simplicity with small dataset, iterating is fine, or we can filter by created_at < now - duration
        
        # But duration is per car. So we get all active cars.
        active_cars = Car.objects.filter(status='ACTIVE')
        
        count = 0
        for car in active_cars:
            expiration_time = car.created_at + timedelta(days=car.auction_duration)
            if now >= expiration_time:
                self.close_auction(car)
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully closed {count} auctions'))

    def close_auction(self, car):
        car.status = 'CLOSED'
        
        # Find highest bid
        highest_bid = car.bids.order_by('-amount').first()
        
        if highest_bid:
            car.winner = highest_bid.user
            self.send_winner_email(car, highest_bid.user, highest_bid.amount)
            self.stdout.write(f"Car {car.id}: Winner is {highest_bid.user.username} with {highest_bid.amount}")
        else:
            self.stdout.write(f"Car {car.id}: No bids")
            
        car.save()

    def send_winner_email(self, car, user, amount):
        subject = f'Congratulations! You won the auction for {car.title}'
        message = f'''
        Hi {user.first_name or user.username},
        
        You have won the auction for "{car.title} {car.year}"!
        
        Final Price: {amount} SAR
        
        Please log in to your account to proceed with the payment and claim your car.
        
        Best regards,
        Mazaady Team
        '''
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            print(f"Email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
