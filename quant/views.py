from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import LoginForm
from django.contrib import auth
from django.contrib.auth.models import User
from django.template.context import RequestContext



# Create your views here.
def login(request):
    return render(request, 'login.html')
    # if request.method == 'GET':
    #     form = LoginForm()
    #     return render_to_response('login.html', RequestContext(request, {'form': form, }))
    # else:
    #     form = LoginForm(request.POST)
    #     if form.is_valid():
    #         username = request.POST.get('username', '')
    #         password = request.POST.get('password', '')
    #         user = auth.authenticate(username=username, password=password)
    #         if user is not None and user.is_active:
    #             auth.login(request, user)
    #             return render_to_response('index.html', RequestContext(request))
    #         else:
    #             return render_to_response('login.html',
    #                                       RequestContext(request, {'form': form, 'password_is_wrong': True}))
    #     else:
    #         return render_to_response('login.html', RequestContext(request, {'form': form, }))


def register(request):
    if request.method == 'POST':
        user_name = request.POST.get('user-name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(user_name, email, password)
        return HttpResponse("hello")
    return render(request, "register.html")

def index(request):
    dicts = {"models": ["Model1", "Model2", "均值方差模型", "Model3"]}
    return render(request, "index.html", dicts)


@csrf_exempt
def search(request):
    if request.method == "POST":
        print(json.loads(request.body.decode('utf-8')))
        print('PPPPOST')
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
