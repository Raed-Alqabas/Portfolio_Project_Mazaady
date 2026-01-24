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
        
        # 1. Activate Pending/Soon Auctions
        pending_soon_cars = Car.objects.filter(status='SOON')
        activated_count = 0
        for car in pending_soon_cars:
            # If start_date is set and passed, or if no start_date (immediate), activate
            if not car.start_date or (car.start_date and now >= car.start_date):
                car.status = 'ACTIVE'
                car.save()
                activated_count += 1
                self.stdout.write(f"Activated Car {car.id}: {car.title}")

        self.stdout.write(self.style.SUCCESS(f'Successfully activated {activated_count} pending/soon auctions'))

        # 2. Close Expired Auctions
        # Duration is now in MINUTES.
        # Expiration = (start_date OR created_at) + duration
        active_cars = Car.objects.filter(status='ACTIVE')
        
        closed_count = 0
        for car in active_cars:
            base_time = car.start_date if car.start_date else car.created_at
            expiration_time = base_time + timedelta(minutes=car.auction_duration)
            
            if now >= expiration_time:
                self.close_auction(car)
                closed_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully closed {closed_count} auctions'))

    def close_auction(self, car):
        from django.utils import timezone
        
        car.status = 'CLOSED'
        # car.closed_at has been removed
        
        # Find highest bid
        highest_bid = car.bids.order_by('-amount').first()
        
        if highest_bid:
            car.winner = highest_bid.user
            # Note: Wallet deduction happens at end of day, not per auction
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
