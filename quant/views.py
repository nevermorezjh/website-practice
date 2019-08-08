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
import json
import time
from pypinyin import lazy_pinyin
import subprocess

with open(r'C:\Users\never\Desktop\website-practice\name_to_id.pkl', 'rb') as f:
    names_to_id = pickle.load(f)

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
    dicts = {"models": ["均值方差模型", "等权重模型", "B-L模型"],
             "g_benchmarks": ['上证指数', '深证成指', '上证50', '沪深300', '中证500', '中证800', '中小板指', '创业板指', '创业板50']
             }
    return render(request, "combine.html", dicts)

def strategy(request):
    dicts = {"models": ["均值方差模型", "等权重模型", "B-L模型"],
             "g_benchmarks": ['上证指数', '深证成指', '上证50', '沪深300', '中证500', '中证800', '中小板指', '创业板指', '创业板50']
             }
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
        display_to_names = dict(zip(display_names, names))
        for i in range(len(display_names)):
            display, pool_id = display_names[i], names[i]
            p = jqdatasdk.get_index_weights(pool_id, date=None)
            q = jqdatasdk.get_index_stocks(pool_id)
            id_to_name = dict(zip(p.index.values, p.display_name.values))
            display_to_names.update(dict(zip(p.display_name.values, p.index.values)))
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

        with open('name_to_id.pkl', 'wb') as f:
            pickle.dump(display_to_names, f)

    def get_dump_data():
        if not os.path.isfile('stocks.pkl'):
            save_data()
        statinfo = os.stat('stocks.pkl')
        t = time.localtime(statinfo.st_mtime)
        now = time.localtime()
        if t.tm_mday != now.tm_mday or t.tm_mon != now.tm_mon or t.tm_year != now.tm_year:
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

@csrf_exempt
def combine_submit(request):
    if request.method == 'POST':
        g_endTime = request.POST.get('g_endTime', 0)
        g_code_list = request.POST.getlist('g_code_list')
        g_lookback = request.POST.get('g_lookback', 0)
        g_benchmark = request.POST.get('g_benchmark', 0)
        if g_benchmark != 0:
            g_benchmark = g_benchmark.strip()

        with open(r'C:\Users\never\Desktop\website-practice\name_to_id.pkl', 'rb') as f:
            id_to_names = pickle.load(f)

        if g_code_list == 0:
            g_code_list = []
        else:
            g_code_list = list(map(lambda x: id_to_names[x], g_code_list))
        data = {
            'g_endTime': g_endTime,
            'g_code_list': g_code_list,
            'g_lookback': g_lookback,
            'g_benchmark': id_to_names[g_benchmark]
        }
        with open(r'C:\Users\never\Desktop\website-practice\json\allocation.json', 'w') as f:
            f.write(json.dumps(data))

    subprocess.check_output([r'C:\JoinQuant-Desktop-Py3\Python\python.exe',
                             r'C:\JoinQuant-Desktop-Py3\Python\allocation_codes\allocation_mean_variance.py'])
    with open(r'C:\Users\never\Desktop\website-practice\json\allocation_result.json', 'r') as f:
        data = f.readlines()[0]
        data = json.loads(data)
    return JsonResponse(data)

@csrf_exempt
def strategy_submit(request):
    if request.method == 'POST':
        g_startTime = request.POST.get('g_startTime', 0)
        g_endTime = request.POST.get('g_endTime', 0)
        g_baseCapital = request.POST.get('g_baseCapital', 0)
        g_rebalance_days = request.POST.get('g_rebalance_days', 0)
        g_commission = request.POST.get('g_commission', 0)
        g_slippage = request.POST.get('g_slippage', 0)

        g_code_list = request.POST.getlist('g_code_list')
        g_lookback = request.POST.get('g_lookback', 0)
        g_benchmark = request.POST.get('g_benchmark', 0)
        g_rf = request.POST.get('g_rf', 0)
        if g_benchmark != 0:
            g_benchmark = g_benchmark.strip()

        if g_code_list == 0:
            g_code_list = []
        else:
            g_code_list = list(map(lambda x: names_to_id[x], g_code_list))
        data = {
            'g_baseCapital': g_baseCapital,
            'g_rebalance_days': g_rebalance_days,
            'g_startTime': g_startTime,
            'g_endTime': g_endTime,
            'g_code_list': g_code_list,
            'g_lookback': g_lookback,
            'g_commission': g_commission,
            'g_slippage': g_slippage,
            'g_benchmark': names_to_id[g_benchmark],
            'g_rf': g_rf
        }
        print(names_to_id[g_benchmark])
        with open(r'C:\Users\never\Desktop\website-practice\json\backtest.json', 'w') as f:
            f.write(json.dumps(data))

    subprocess.check_output([r'C:\JoinQuant-Desktop-Py3\Python\python.exe',
                             r'C:\JoinQuant-Desktop-Py3\Python\backtest_codes\backtest_mean_variance.py'])
    subprocess.check_output(['python', r'C:\JoinQuant-Desktop-Py3\Python\backtest_codes\test_backtest_show.py'])
    # print(output)
    with open(r'C:\Users\never\Desktop\website-practice\json\result.json', 'r') as f:
        data = f.readlines()[0]
        data = json.loads(data)
    return JsonResponse(data)
