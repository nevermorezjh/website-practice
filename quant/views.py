from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import RegisterForm
from django.contrib import auth
from django.contrib.auth.models import User
from django.template.context import RequestContext
import re


# Create your views here.
def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            request.session['user'] = username
            return HttpResponseRedirect('/combine')
        else:
            return render(request, 'login.html', context={'error': True})
    return render(request, 'login.html')

def logout(request):
    auth.logout(request)
    return render(request, 'login.html')


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            print('valid')
            form.save()
            return render(request, 'login.html')
    else:
        form = RegisterForm()

    errors = []
    for key, item in form.errors.items():
        errors.append(item)
    return render(request, 'register.html', context={'errors': errors})

def combine(request):
    dicts = {"models": ["Model1", "Model2", "均值方差模型", "Model3"]}
    return render(request, "combine.html", dicts)


@csrf_exempt
def search(request):
    if request.method == "POST":
        print(json.loads(request.body.decode('utf-8')))
    print(request.POST)
    return HttpResponse("Hello")


def get_stocks(request):
    itemlist = ["沪深300", "中证500", "上证50", "上证180", "创业50", "深证100", "创业300"]
    stockpools = {}
    for item in itemlist:
        stocks = []
        for i in range(30):
            stocks.append(item + '-' + str(i))
        stockpools[item] = stocks
    return JsonResponse(stockpools)


def get_restrict(request):
    itemlist = ["Restrict1", "Restrict2", "Restrict3"]
    stockpools = {}
    for item in itemlist:
        stocks = []
        for i in range(30):
            stocks.append(item + '-' + str(i))
        stockpools[item] = stocks
    return JsonResponse(stockpools)


@csrf_exempt
def combine_arrange(request):
    if request.method == 'POST':
        concat = request.POST
        postBody = request.body
        # print(concat)
        # print(type(postBody))
        # print(postBody)
        json_result = json.loads(postBody.decode('utf-8'))
        print(type(json_result))
        for key in json_result:
            print(key, json_result[key])
        print(json_result['date'])
        return JsonResponse({"123": 314})
# return HttpResponseRedirect("ok")
