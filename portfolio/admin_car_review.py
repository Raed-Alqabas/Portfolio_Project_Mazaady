@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_car_api(request, pk):
    """Admin approves a car - sets status to PENDING or ACTIVE"""
    from .models import Car
    from django.utils import timezone
    from datetime import datetime
    
    # Check if user is admin/staff
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=403)
    
    try:
        car = Car.objects.get(pk=pk, status='IN_REVIEW')
        
        # Determine status based on start_date
        if car.start_date:
            start_datetime = datetime.fromisoformat(str(car.start_date).replace('Z', '+00:00'))
            if timezone.is_naive(start_datetime):
                start_datetime = timezone.make_aware(start_datetime)
            
            if start_datetime > timezone.now():
                car.status = 'PENDING'
            else:
                car.status = 'ACTIVE'
        else:
            car.status = 'ACTIVE'
        
        car.save()
        
        return Response({
            'message': 'Car approved successfully',
            'status': car.status
        })
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or not in review'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_car_api(request, pk):
    """Admin rejects a car - sets status to REJECTED"""
    from .models import Car
    
    # Check if user is admin/staff
    if not request.user.is_staff:
        return Response({'error': 'Unauthorized'}, status=403)
    
    try:
        car = Car.objects.get(pk=pk, status='IN_REVIEW')
        car.status = 'REJECTED'
        car.save()
        
        return Response({'message': 'Car rejected successfully'})
    except Car.DoesNotExist:
        return Response({'error': 'Car not found or not in review'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
