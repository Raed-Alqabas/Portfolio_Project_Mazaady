from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Reset wallet and bidding access for users who won auctions today'

    def handle(self, *args, **options):
        from portfolio.models import Car, Profile
        
        # Get today's date range
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        self.stdout.write(f'Processing wallets for {today_start.date()}')
        
        # Find all cars that closed today
        # Find all cars that closed today
        potential_closed = Car.objects.filter(
            status='CLOSED',
            winner__isnull=False
        )
        
        cars_closed_today = []
        for car in potential_closed:
            if not car.start_date:
                continue
            closing_time = car.start_date + timedelta(minutes=car.auction_duration)
            if today_start <= closing_time < today_end:
                cars_closed_today.append(car)
        
        self.stdout.write(f'Found {len(cars_closed_today)} closed auctions today')
        
        # Get unique winners
        winners_today = set()
        for car in cars_closed_today:
            winners_today.add(car.winner)
        
        self.stdout.write(f'Found {len(winners_today)} unique winners today')
        
        # Process each winner
        reset_count = 0
        for user in winners_today:
            try:
                profile = user.profile
                
                # Only reset if they have wallet balance
                if profile.wallet_balance >= Decimal('1500.00'):
                    # Reset wallet and revoke bidding access
                    profile.wallet_balance = Decimal('0.00')
                    profile.bidding_access = False
                    profile.save(update_fields=['wallet_balance', 'bidding_access'])
                    
                    reset_count += 1
                    self.stdout.write(f'  ✓ Reset wallet for {user.username}')
                else:
                    self.stdout.write(f'  ○ Skipped {user.username} (wallet already empty)')
                    
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ✗ Error processing {user.username}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully reset {reset_count} wallets'))
