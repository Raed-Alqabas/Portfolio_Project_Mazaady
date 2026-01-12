from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from .forms import UserRegisterForm
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context
from django.http import JsonResponse
import os  
import requests
from .models import Mazaady, Payment, AuctionEntry
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pay_bidding_access_api(request):
    """One-time payment for global bidding access - 1500 SAR"""
    
    # Check if user already has access
    try:
        from .models import Profile
        profile = request.user.profile
        if profile.bidding_access:
            return Response({'error': 'You already have bidding access'}, status=400)
    except:
        # Create profile if doesn't exist
        Profile.objects.create(
            user=request.user,
            phone_number="",
            phone_country_code="966"
        )
    
    # Fixed 1500 SAR entry fee
    entry_amount = Decimal("1500.00")
    
    from .models import Payment
    payment = Payment.objects.create(
        user=request.user,
        auction=None,  # Global payment, not per auction
        purpose="BIDDING_ACCESS",
        amount=entry_amount,
        currency="SAR",
        status="INITIATED",
    )
    
    tap_url = "https://api.tap.company/v2/charges/"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": f"Bearer {os.getenv('TAP_SECRET_KEY')}",
    }
    
    base = "http://127.0.0.1:8000"
    
    payload = {
        "amount": float(payment.amount),
        "currency": payment.currency,
        "customer": {
            "first_name": request.user.first_name or "Mazady",
            "last_name": request.user.last_name or "User",
            "email": request.user.email,
            "phone": {"country_code": 966, "number": 500000000},
        },
        "source": {"id": "src_card"},
        "redirect": {"url": f"{base}/api/tap/return/?pid={payment.public_id}"},
        "post": {"url": f"{base}/api/tap/webhook/"},
        "reference": {"order": str(payment.public_id)},
    }
    
    r = requests.post(tap_url, json=payload, headers=headers)
    data = r.json()
    
    tap_charge_id = data.get("id")
    payment_url = data.get("transaction", {}).get("url")
    
    if not tap_charge_id or not payment_url:
        payment.status = "FAILED"
        payment.save(update_fields=["status"])
        return Response({'error': f"Tap error: {data}"}, status=400)
    
    payment.tap_charge_id = tap_charge_id
    payment.save(update_fields=["tap_charge_id"])
    
    # Return the payment URL to frontend for redirect
    return Response({'payment_url': payment_url})

from rest_framework.decorators import api_view
from rest_framework.response import Response

from datetime import datetime, timedelta
import random

def tap_return(request):
    pid = request.GET.get("pid")
    if not pid:
        return HttpResponse("Missing pid", status=400)

    payment = get_object_or_404(Payment, public_id=pid)

    url = f"https://api.tap.company/v2/charges/{payment.tap_charge_id}"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {os.getenv('TAP_SECRET_KEY')}",
    }

    r = requests.get(url, headers=headers)
    data = r.json()

    status = data.get("status") or "UNKNOWN"

    if status == "CAPTURED":
        payment.status = "CAPTURED"
        payment.save(update_fields=["status"])

        # Grant bidding access for global payments
        if payment.purpose == "BIDDING_ACCESS":
            try:
                from .models import Notification
                profile = payment.user.profile
                profile.bidding_access = True
                profile.save(update_fields=["bidding_access"])
                
                # Create payment confirmation notification
                Notification.objects.create(
                    user=payment.user,
                    notification_type='PAYMENT_CONFIRMED',
                    title='تم تأكيد الدفع',
                    message=f'تم تأكيد دفع رسوم الاشتراك ({payment.amount} ريال). يمكنك الآن المزايدة على جميع السيارات!',
                    link='/'
                )
                
                # Redirect to car page if available, otherwise home
                if payment.car:
                    return redirect(f'http://localhost:3000/auction/{payment.car.id}')
                else:
                    return redirect('http://localhost:3000/')
            except Exception as e:
                return HttpResponse(f"⚠️ Payment captured but failed to grant access: {e}")
        
        # Handle auction-specific entry fees
        entry, _ = AuctionEntry.objects.get_or_create(
            auction=payment.auction,
            user=payment.user,
        )
        entry.is_paid = True
        entry.paid_at = timezone.now()
        entry.save(update_fields=["is_paid", "paid_at"])

        return HttpResponse("✅ Entry deposit paid. You can now enter this auction.")
    else:
        payment.status = "FAILED"
        payment.save(update_fields=["status"])
        return HttpResponse(f"❌ Payment not completed. Status: {status}")  

def tap_verify(request):
    charge_id = request.GET.get("charge_id")

    if not charge_id:
        return HttpResponse(
            "Missing charge_id. Example: /tap/verify/?charge_id=chg_xxx",
            status=400
        )

    url = f"https://api.tap.company/v2/charges/{charge_id}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {os.getenv('TAP_SECRET_KEY')}",
    }

    r = requests.get(url, headers=headers)
    data = r.json()

    status = data.get("status")
    return HttpResponse(f"Charge status: <b>{status}</b><br><br>Full response:<br>{data}")

FAKE_PRICE = 10000

# Create your views here.

def home(request):
    """Home page view"""
    return HttpResponse("Welcome to Mazaady Portfolio Project!")

@api_view(["GET"])
def test_api(request):
    return Response({"status": "Django API working"})

#################### index#######################################
def index(request):
    fake_auction = {
        "title": "Toyota Land Cruiser 2022",
        "current_price": FAKE_PRICE,
        "end_time": datetime.now() + timedelta(hours=1)
    }
    return render(request, 'portfolio/index.html', {"auction": fake_auction,'title':'index'})
 
########### register here #####################################
@api_view(["POST"])
def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            ######################### mail system #################################### 
            htmly = get_template('portfolio/Email.html')
            d = { 'username': username }
            subject, from_email, to = 'Welcome', 'MazzadyApp', email
            html_content = htmly.render(d)
            msg = EmailMultiAlternatives(subject, html_content, from_email, [to])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            # print(msg)
            ################################################################## 
            messages.success(request, f'Your account has been created ! You are now able to log in')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'portfolio/register.html', {'form': form, 'title':'register here'})
 
################ login forms###################################################
@api_view(["POST"])
def Login(request):
    if request.method == 'POST':
 
        # AuthenticationForm_can_also_be_used__
 
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username = username, password = password)
        if user is not None:
            form = login(request, user)
            messages.success(request, f' welcome {username} !!')
            return redirect('index')
        else:
            messages.info(request, f'account done not exit plz sign in')
    form = AuthenticationForm()
    return render(request, 'portfolio/login.html', {'form':form, 'title':'log in'})

# def auction_live_price(request, auction_id):
#     auction = Auction.objects.get(id=auction_id)
#     return JsonResponse({
#         "price": auction.current_price
#     })

def auction_live_price(request):
    global FAKE_PRICE

    FAKE_PRICE += random.choice([0, 100, 200, 300])

    return JsonResponse({
        "price": FAKE_PRICE
    })

