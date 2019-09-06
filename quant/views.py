from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import RegisterForm
from django.contrib import auth
from django.contrib.auth.models import User
from django.template.context import RequestContext
import re
import json
import time

import numpy as np
import subprocess
from datetime import datetime, timedelta
import pandas as pd
from . import asset_infos
import random, string
from django.core.cache import cache
import redis
pool = redis.ConnectionPool(host='localhost', port=6379,db=1)
red = redis.Redis(connection_pool=pool)
# celery -A quant worker -l info -P eventlet
if red.get('names_to_id') is None:
    names_to_id = {}
else:
    names_to_id = red.get('names_to_id')
    names_to_id = json.loads(names_to_id)


from .tasks import run_test_suit, run_allocation, run_backtest, run_get_subject_message, run_get_data


def tasks(request):
    print('before run_test_suit')
    result = run_test_suit.delay('110')
    print('after run_test_suit')
    return HttpResponse(str(result.get()))

# Create your views here.
def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            request.session['user'] = username
            return HttpResponseRedirect('/allocation')
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


def allocation(request):
    dicts = {"models": ["均值方差模型", "等权重模型", "最小方差模型", "风险评价模型",  "B-L模型"],
             "g_benchmarks": ['上证指数', '深证成指', '上证50', '沪深300', '中证500', '中证800', '中小板指', '创业板指', '创业板50'],
             "date": datetime.now().strftime("%m/%d/%Y")
             }
    return render(request, "allocation.html", dicts)


def backtest(request):
    dicts = {"models": ["均值方差模型", "等权重模型", "最小方差模型", "风险评价模型",  "B-L模型"],
             "g_benchmarks": ['上证指数', '深证成指', '上证50', '沪深300', '中证500', '中证800', '中小板指', '创业板指', '创业板50'],
             "begin_date": (datetime.now() - timedelta(days=30)).strftime("%m/%d/%Y"),
             "end_date": datetime.now().strftime("%m/%d/%Y")
             }
    return render(request, "backtest.html", dicts)


@csrf_exempt
def get_data(request):
    def transform_date(date):
        m, d, y = date.split('/')
        date = y + '-' + m + '-' + d
        return date

    start_date = request.POST.get('start_date', 0)
    end_date = request.POST.get('end_date', 0)
    start_date = transform_date(start_date)
    end_date = transform_date((end_date))

    result = run_get_data.delay(start_date, end_date)
    stock_pool, industry_pool, index_pool, exchanged_fund_pool, open_fund_pool = result.get()

    global  names_to_id
    names_to_id = red.get('names_to_id')
    names_to_id = json.loads(names_to_id)

    data = {
        'stockPool': stock_pool,
        'industryPool': industry_pool,
        'indexPool': index_pool,
        'exchangedFundPool': exchanged_fund_pool,
        'openFundPool': open_fund_pool
    }

    return JsonResponse(data)


def get_constraint(code_list, restrict, mp):
    ret = []
    for item in restrict:
        mini, x, maxi = item.split('<=')
        if x in code_list:
            ret.append([0, mini, mp[x], maxi])
        else:
            ret.append([1, mini, mp[x], maxi])
    return ret


@csrf_exempt
def allocation_submit(request):
    if request.method == 'POST':
        def randomword(length):
            letters = string.ascii_lowercase
            return ''.join(random.choice(letters) for i in range(length))

        random_str = randomword(32)
        g_endTime = request.POST.get('g_endTime', 0)
        type = request.POST.get('g_type', 0)
        g_code_list = request.POST.getlist('g_code_list')
        restrict = request.POST.getlist('g_restrict', [])
        g_lookback = request.POST.get('g_lookback', 0)
        g_benchmark = request.POST.get('g_benchmark', 0)
        model_type = request.POST.get('model_type', 0)
        g_rf = request.POST.get('g_rf', 0)
        bl_data = request.POST.getlist('bl_data')
        names = {}
        if type == '股票':
            g_asset_type = 'stock'
            names.update(names_to_id['stock'])
            names.update(names_to_id['industry_index'])
        elif type == '大盘指数':
            g_asset_type = 'index'
        elif type == '行业指数':
            g_asset_type = 'industry_index'
        elif type == '场外公募基金':
            g_asset_type = 'open_fund'
            names.update(names_to_id['open_fund'])
            names.update(sub_type_dict)
        else:
            g_asset_type = 'exchanged_fund'
            names.update(sub_type_dict)


        restrict = get_constraint(g_code_list, restrict, names)
        g_code_list = list(map(lambda x: names_to_id[g_asset_type][x], g_code_list))

        data = {
            'g_endTime': g_endTime,
            'g_code_list': g_code_list,
            'g_asset_type': g_asset_type,
            'g_lookback': g_lookback,
            'g_benchmark': names_to_id['index'][g_benchmark],
            'constraint': restrict,
            'model_type': model_type,
            'bl_data': bl_data,
            'g_rf': g_rf,
        }
        current_name = f'allocation_result-{random_str}'
        red.set(current_name, json.dumps(data))
        result = run_allocation.delay(current_name, random_str)
        return JsonResponse(result.get())


@csrf_exempt
def backtest_submit(request):
    if request.method == 'POST':
        import random, string

        def randomword(length):
            letters = string.ascii_lowercase
            return ''.join(random.choice(letters) for i in range(length))

        random_str = randomword(32)
        g_startTime = request.POST.get('g_startTime', 0)
        g_endTime = request.POST.get('g_endTime', 0)
        g_baseCapital = request.POST.get('g_baseCapital', 0)
        g_rebalance_days = request.POST.get('g_rebalance_days', 0)
        g_code_list = request.POST.getlist('g_code_list')
        g_commission = request.POST.get('g_commission', 0)
        g_slippage = request.POST.get('g_slippage', 0)
        g_lookback = request.POST.get('g_lookback', 0)
        g_benchmark = request.POST.get('g_benchmark', 0)
        model_type = request.POST.get('model_type', 0)
        restrict = request.POST.getlist('g_restrict', [])
        g_rf = request.POST.get('g_rf', 0)
        type = request.POST.get('g_type', 0)
        bl_data = request.POST.getlist('bl_data')

        names = {}
        if type == '股票':
            g_asset_type = 'stock'
            names.update(names_to_id['stock'])
            names.update(names_to_id['industry_index'])
        elif type == '大盘指数':
            g_asset_type = 'index'
        elif type == '行业指数':
            g_asset_type = 'industry_index'
        elif type == '场外公募基金':
            g_asset_type = 'open_fund'
            names.update(names_to_id['open_fund'])
            names.update(sub_type_dict)
        else:
            g_asset_type = 'exchanged_fund'
            names.update(sub_type_dict)
        restrict = get_constraint(g_code_list, restrict, names)
        g_code_list = list(map(lambda x: names_to_id[g_asset_type][x], g_code_list))
        data = {
            'g_baseCapital': g_baseCapital,
            'g_rebalance_days': g_rebalance_days,
            'g_startTime': g_startTime,
            'g_endTime': g_endTime,
            'g_code_list': g_code_list,
            'g_lookback': g_lookback,
            'g_commission': g_commission,
            'model_type': model_type,
            'g_slippage': g_slippage,
            'g_benchmark': names_to_id['index'][g_benchmark],
            'constraint': restrict,
            'g_rf': g_rf,
            'bl_data': bl_data,
            'g_asset_type': g_asset_type,
        }
        current_name = f'backtest-{random_str}'
        red.set(current_name, json.dumps(data))
        result = run_backtest.delay(type, random_str)
        return JsonResponse(result.get())


@csrf_exempt
def get_subject_message(request):
    names = request.POST.getlist('g_code_list')
    type = request.POST.get('g_type', 0)
    g_endTime = request.POST.get('g_endTime', 0)
    m, d, y = g_endTime.split('/')
    g_endTime = '-'.join([y, m, d])
    if type == '股票':
        g_asset_type = 'stock'
    elif type == '大盘指数':
        g_asset_type = 'index'
    elif type == '行业指数':
        g_asset_type = 'industry_index'
    elif type == '场外公募基金':
        g_asset_type = 'open_fund'
    else:
        g_asset_type = 'exchanged_fund'
    g_code_list = list(map(lambda x: names_to_id[g_asset_type][x], names))

    if type == "股票":
        g_type = 'stock'
    elif type == "大盘指数":
        g_type = 'index'
    elif type == "行业指数":
        g_type = 'industry_index'
    else:
        g_type = 'etf'
    res = run_get_subject_message.delay(g_code_list, g_type, g_endTime)
    return JsonResponse(res.get())
