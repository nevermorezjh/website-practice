from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import RegisterForm
from django.contrib import auth
from django.contrib.auth.models import User
from django.template.context import RequestContext
import re
import jqdatasdk
import pickle
import os
import time
from pypinyin import lazy_pinyin

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
    dicts = {"models": ["均值方差模型", "等权重模型", "B-L模型"]}
    return render(request, "combine.html", dicts)

def strategy(request):
    dicts = {"models": ["均值方差模型", "等权重模型"]}
    return render(request, "strategy.html", dicts)

@csrf_exempt
def search(request):
    if request.method == "POST":
        print(json.loads(request.body.decode('utf-8')))
    print(request.POST)
    return HttpResponse("Hello")


def get_stocks(request):
    def save_data():
        jqdatasdk.auth('13570363918', '1q2w3e4r\'')
        display_names = ['上证指数', '深证成指', '上证50', '沪深300', '中证500', '中证800', '中小板指', '创业板指', '创业板50']
        names = ['000001.XSHG', '399001.XSHE', '000016.XSHG', '000300.XSHG', '000905.XSHG', '000906.XSHG',
                 '399005.XSHE', '399006.XSHE', '399673.XSHE']

        stockpools = {}
        for i in range(len(display_names)):
            display, pool_id = display_names[i], names[i]
            p = jqdatasdk.get_index_weights(pool_id, date=None)
            q = jqdatasdk.get_index_stocks(pool_id)
            id_to_name = dict(zip(p.index.values, p.display_name.values))
            stocks = []
            for item in q:
                try:
                    stocks.append(id_to_name[item])
                except Exception as e:
                    pass
            stocks = sorted(stocks, key=lambda x: ' '.join(lazy_pinyin(x)))
            stockpools[display] = stocks

        with open('stocks.pkl', 'wb') as f:
            pickle.dump(stockpools, f)

    def get_dump_data():
        if not os.path.isfile('stocks.pkl'):
            save_data()
        statinfo = os.stat('stocks.pkl')
        t = time.localtime(statinfo.st_mtime)
        now = time.localtime()
        if t.tm_mday != now.tm_mday or t.tm_mon != now.tm_mon or t.tm_year != now.tm_year:
            print(now)
            print(t)
            print(111)
            save_data()

        with open('stocks.pkl', 'rb') as f:
            stockpools = pickle.load(f)
        return stockpools

    stockpools = get_dump_data()

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


def get_trades(request):
    tradepools = {
        '申万一级行业': ['能源', '材料', '工业', '可选消费指', '日常消费', '医疗保健', '金融', '信息技术', '电信服务', '公用事业', '房地产']
    }

    return JsonResponse(tradepools)