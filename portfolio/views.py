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


def pay_entry_fee(request, auction_id):
    payer_email = request.GET.get("email")
    if not payer_email:
        return HttpResponse("Missing email. Example: ?email=test@test.com", status=400)

    auction = get_object_or_404(Mazaady, id=auction_id)

    # 2% refundable entry deposit based on starting price
    entry_amount = (auction.starting_price * Decimal("0.02")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    payment = Payment.objects.create(
        auction=auction,
        payer_email=payer_email,
        purpose="ENTRY_FEE",
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
            "first_name": "Mazady",
            "last_name": "Bidder",
            "email": payer_email,
            "phone": {"country_code": 966, "number": 500000000},
        },
        "source": {"id": "src_all"},
        "redirect": {"url": f"{base}/tap/return/?pid={payment.public_id}"},
        "post": {"url": f"{base}/tap/webhook/"},
        "reference": {"order": str(payment.public_id)},
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

    return redirect(payment_url)

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

        entry, _ = AuctionEntry.objects.get_or_create(
            auction=payment.auction,
            payer_email=payment.payer_email,
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

#################### index####################################### 
def index(request):
    fake_auction = {
        "title": "Toyota Land Cruiser 2022",
        "current_price": FAKE_PRICE,
        "end_time": datetime.now() + timedelta(hours=1)
    }
    return render(request, 'portfolio/index.html', {"auction": fake_auction,'title':'index'})
 
########### register here ##################################### 
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

