from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
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
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, timedelta
import random


@api_view(["GET"])
def pay_membership(request):
    if not request.user.is_authenticated:
        return HttpResponse("Please login first", status=401)

    if hasattr(request.user, "profile") and getattr(request.user.profile, "bidding_access", False):
        return HttpResponse("You already have unlimited bidding access. No need to pay again.")

    user = request.user
    if not user.email:
        return HttpResponse("Your account is missing an email.", status=400)

    if not hasattr(user, "profile"):
        return HttpResponse("Your account has no profile record.", status=400)

    profile = user.profile
    cc_raw = getattr(profile, "phone_country_code", None)
    num_raw = getattr(profile, "phone_number", None)

    if not cc_raw or not num_raw:
        return HttpResponse("Your account is missing phone country code or phone number.", status=400)

    country_code = int("".join(c for c in str(cc_raw) if c.isdigit()))
    phone_number = int("".join(c for c in str(num_raw) if c.isdigit()))

    amount = Decimal("1500.00")

    payment = Payment.objects.create(
        user=user,
        purpose="GLOBAL_ACCESS",
        amount=amount,
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
            "username": user.username,
            "first_name": user.first_name or "User",
            "last_name": user.last_name or "Mazady",
            "email": user.email,
            "phone": {"country_code": country_code, "number": phone_number},
        },
        "source": {"id": "src_all"},
        "redirect": {"url": f"{base}/api/tap/return/?pid={payment.public_id}&next={request.GET.get('next', '/')}"},
        "post": {"url": f"{base}/api/tap/webhook/"},
        "reference": {"order": str(payment.public_id)},
        "metadata": {"purpose": "GLOBAL_ACCESS"},
    }

    r = requests.post(tap_url, json=payload, headers=headers)
    data = r.json()

    tap_charge_id = data.get("id")
    payment_url = data.get("transaction", {}).get("url")

    if not tap_charge_id or not payment_url:
        payment.status = "FAILED"
        payment.save(update_fields=["status"])
        return HttpResponse(f"Tap error: {data}", status=400)

    payment.tap_charge_id = tap_charge_id
    payment.save(update_fields=["tap_charge_id"])

    return Response({"url": payment_url})

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
        
        if payment.purpose == "GLOBAL_ACCESS":
            profile = payment.user.profile
            profile.bidding_access = True
            profile.save(update_fields=["bidding_access"])
            
            # Redirect back to frontend
            next_path = request.GET.get("next", "/")
            return redirect(f"http://localhost:3000{next_path}")
        
        return HttpResponse("✅ Payment processed (Unknown Purpose).")
    else:
        payment.status = "FAILED"
        payment.save(update_fields=["status"])
        return HttpResponse(f"❌ Payment not completed. Status: {status}")  

@csrf_exempt
@api_view(["POST"])
def tap_webhook(request):
    """
    Handle asynchronous notifications from Tap.
    """
    data = request.data
    charge_id = data.get("id")
    status = data.get("status")
    
    # We can also get our internal public_id from the reference
    public_id = data.get("reference", {}).get("order")
    
    if not charge_id or not public_id:
        return Response({"error": "Missing data"}, status=400)
        
    try:
        payment = Payment.objects.get(public_id=public_id)
        if status == "CAPTURED":
            payment.status = "CAPTURED"
            payment.tap_charge_id = charge_id
            payment.save()
            
            if payment.purpose == "GLOBAL_ACCESS":
                profile = payment.user.profile
                profile.bidding_access = True
                profile.save(update_fields=["bidding_access"])
                
        elif status == "FAILED" or status == "CANCELLED":
            payment.status = "FAILED"
            payment.save()
            
        return Response({"status": "ok"})
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=404)

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

