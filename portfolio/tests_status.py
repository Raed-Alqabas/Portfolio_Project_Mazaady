from django.test import TestCase
from django.contrib.auth.models import User
from .models import Car
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient

class CarStatusTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_default_status_is_in_review(self):
        """Verify that a newly created car defaults to IN_REVIEW"""
        car = Car.objects.create(
            user=self.user,
            title="Test Car",
            brand="Toyota",
            model="Camry",
            year=2020,
            color="White",
            location="Riyadh",
            description="Test Description",
            mileage=10000,
            fuel="Gasoline",
            transmission="Automatic",
            condition="Excellent",
            accidents="no",
            start_bid=50000
        )
        self.assertEqual(car.status, 'IN_REVIEW')

    def test_update_resets_status_to_in_review(self):
        """Verify that updating a car (even if ACTIVE) resets it to IN_REVIEW"""
        car = Car.objects.create(
            user=self.user,
            title="Test Car",
            brand="Toyota",
            model="Camry",
            year=2020,
            color="White",
            location="Riyadh",
            description="Test Description",
            mileage=10000,
            fuel="Gasoline",
            transmission="Automatic",
            condition="Excellent",
            accidents="no",
            start_bid=50000,
            status='ACTIVE'
        )
        
        url = f'/api/cars/{car.id}/update/'
        # Note: We use format='multipart' because the view uses MultiPartParser/FormParser
        response = self.client.patch(url, {'title': 'Updated Title'}, format='multipart')
        
        self.assertEqual(response.status_code, 400) # backend prevents updating ACTIVE ads
        
        car.status = 'REJECTED'
        car.save()
        
        response = self.client.patch(url, {'title': 'Updated Title'}, format='multipart')
        self.assertEqual(response.status_code, 200)
        
        car.refresh_from_db()
        self.assertEqual(car.status, 'IN_REVIEW')
        self.assertEqual(car.title, 'Updated Title')

    def test_pending_status_for_future_auction(self):
        """Verify that add_car_api can set status to PENDING for future auctions"""
        future_date = timezone.now() + timedelta(days=1)
        data = {
            'title': 'Future Car',
            'brand': 'Toyota',
            'model': 'Camry',
            'year': 2023,
            'color': 'Black',
            'location': 'Jeddah',
            'description': 'Future Description',
            'mileage': 0,
            'fuel': 'Electric',
            'transmission': 'Automatic',
            'condition': 'New',
            'accidents': 'no',
            'start_bid': 100000.0, # Snake case for direct DRF save mapping in view? 
            'auction_duration': 1440,
            'startDate': future_date.isoformat(),
            'status': 'PENDING'
        }
        
        response = self.client.post('/api/cars/add/', data, format='multipart')
        self.assertEqual(response.status_code, 201)
        
        car_id = response.data['id']
        car = Car.objects.get(id=car_id)
        self.assertEqual(car.status, 'PENDING')

    def test_soon_to_active_transition(self):
        """Verify that SOON auctions transition to ACTIVE when start_date is reached"""
        from django.core.management import call_command
        
        # Create a car with status SOON and start_date in the past
        past_date = timezone.now() - timedelta(minutes=5)
        car = Car.objects.create(
            user=self.user,
            title="Soon Car",
            brand="Toyota",
            model="Camry",
            year=2020,
            color="White",
            location="Riyadh",
            description="Test Description",
            mileage=10000,
            fuel="Gasoline",
            transmission="Automatic",
            condition="Excellent",
            accidents="no",
            start_bid=50000,
            status='SOON',
            start_date=past_date,
            auction_duration=60
        )
        
        # Run the management command
        call_command('close_auctions')
        
        car.refresh_from_db()
        self.assertEqual(car.status, 'ACTIVE')
