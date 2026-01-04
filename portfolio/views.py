from django.shortcuts import render, redirect
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
from rest_framework.decorators import api_view
from rest_framework.response import Response

from datetime import datetime, timedelta
import random


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

