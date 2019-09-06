import time
from website.celery import app
import subprocess
import json
import pandas as pd
from . import user_passwd
import jqdatasdk
from pypinyin import lazy_pinyin
from datetime import datetime, timedelta
from . import asset_infos
import redis

pool = redis.ConnectionPool(host='localhost', port=6379, db=1)
red = redis.Redis(connection_pool=pool)


@app.task()
def add(x, y):
    return x + y


@app.task
def run_test_suit(ts_id):
    print("++++++++++++++++++++++++++++++++++++")
    print('jobs[ts_id=%s] running....' % ts_id)
    print('jobs[ts_id=%s] done' % ts_id)
    time.sleep(10)
    result = True
    return result


@app.task
def run_backtest(type, random_str):
    try:
        if type in ['股票', '大盘指数', '行业指数', '场内基金']:
            subprocess.check_output([r'C:\JoinQuant-Desktop-Py3\Python\python.exe',
                                     r'C:\JoinQuant-Desktop-Py3\Python\backtest_codes\backtest_mean_variance.py',
                                     random_str])
        else:
            subprocess.check_output([r'C:\JoinQuant-Desktop-Py3\Python\python.exe',
                                     r'C:\JoinQuant-Desktop-Py3\Python\backtest_codes\open_fund_backtest_mean_variance.py',
                                     random_str])
        subprocess.check_output(
            ['python', r'C:\JoinQuant-Desktop-Py3\Python\backtest_codes\test_backtest_show.py', random_str])
        current_name = f'backtest-result-{random_str}'
        data = red.get(current_name)
        red.expire(current_name, 600)
        data = json.loads(data)
        return data
    except Exception as e:
        return None


@app.task
def run_allocation(current_name, random_str):
    try:
        subprocess.check_output([r'C:\JoinQuant-Desktop-Py3\Python\python.exe',
                                 r'C:\JoinQuant-Desktop-Py3\Python\allocation_codes\allocation_mean_variance.py',
                                 random_str])
        data = red.get(current_name)
        result = json.loads(data)
        red.expire(current_name, 600)
        return result
    except Exception as e:
        return None


@app.task
def run_get_data(start_date, end_date):
    def save_data(start_date, end_date):
        jqdatasdk.auth(username=user_passwd.user_name, password=user_passwd.passwd)
        names_to_id = red.get('names_to_id')
        names_to_id = json.loads(names_to_id)
        indices = pd.read_csv(r'C:\Users\never\Desktop\website-practice\indices.csv')
        names = []
        display_names = []
        index_name_to_id = {}
        for i in range(len(indices)):
            if str(indices.start_date[i]) <= start_date and end_date <= str(indices.end_date[i]):
                names.append(indices.id[i])
                display_names.append(indices.display_name[i])
                index_name_to_id[indices.display_name[i]] = indices.id[i]
        indices = display_names
        names_to_id['index'] = index_name_to_id

        industries_df = jqdatasdk.get_industries('sw_l1')

        industry_end_date = {
            '建筑建材I': '2014-02-21',
            '机械设备I': '2014-02-21',
            '交运设备I': '2014-02-21',
            '信息设备I': '2014-02-21',
            '金融服务I': '2014-02-21',
            '信息服务I': '2014-02-21',
        }
        industries = []
        industry_name_to_id = {}

        for industry_name, industry_id, start_time in zip(industries_df.name.values, industries_df.index.values,
                                                          industries_df.start_date.values):
            st = str(start_time)
            if industry_name in industry_end_date.keys() and st <= start_date and end_date < industry_end_date[
                industry_name]:
                industries.append(industry_name)
                industry_name_to_id.update({industry_name: industry_id})
            elif industry_name not in industry_end_date.keys() and st <= start_date:
                industries.append(industry_name)
                industry_name_to_id.update({industry_name: industry_id})
        names_to_id['industry_index'] = industry_name_to_id

        stock_pool = {}
        stock_ids, stock_names = [], []
        stock_name_to_id = {}
        for i in range(len(display_names)):
            display, pool_id = display_names[i], names[i]
            p = jqdatasdk.get_all_securities(types=['stock'], date=start_date)
            p = p[p.end_date >= end_date]

            q = jqdatasdk.get_index_stocks(pool_id)
            id_to_name = dict(zip(p.index.values, p.display_name.values))
            stock_name_to_id.update(dict(zip(p.display_name.values, p.index.values)))
            stocks = []
            for item in q:
                try:
                    stocks.append(id_to_name[item])
                    stock_ids.append(item)
                    stock_names.append(id_to_name[item])

                except Exception as e:
                    pass
            stocks = sorted(stocks, key=lambda x: ' '.join(lazy_pinyin(x)))
            stock_pool[display] = stocks
        names_to_id['stock'] = stock_name_to_id

        get_funds = jqdatasdk.get_all_securities('fund', date=start_date)

        display_names = ['场内ETF', '场内LOF', '分级基金A', '分级基金B', '场内货币基金']
        names = ['etf', 'lof', 'fja', 'fjb', 'money_market_fund']
        exchanged_fund_pool = {}
        exchanged_name_to_id = dict(zip(display_names, names))
        for i in range(len(display_names)):
            display, pool_id = display_names[i], names[i]
            p = get_funds[get_funds['type'] == pool_id]
            y1 = (p.start_date <= start_date).values
            y2 = (p.end_date >= end_date).values
            p = p[np.logical_and(y1, y2)]

            q = p.index.values
            id_to_name = dict(zip(p.index.values, p.display_name.values))
            exchanged_name_to_id.update(dict(zip(p.display_name.values, p.index.values)))
            funds = []
            for item in q:
                try:
                    funds.append(id_to_name[item])
                except Exception as e:
                    pass
            funds = sorted(funds, key=lambda x: ' '.join(lazy_pinyin(x)))
            exchanged_fund_pool[display] = funds
        names_to_id['exchanged_fund'] = exchanged_name_to_id

        get_funds = jqdatasdk.get_all_securities('open_fund', date=start_date)
        get_funds = get_funds[get_funds.end_date >= end_date]
        display_names = ['股票型', '混合型', '债券型', '货币型', 'ETF联接', '黄金', 'QDII']
        names = ['stock_fund', 'mixture_fund', 'bond_fund', 'money_market_fund', 'fund_fund', 'noble_metal_fund',
                 'QDII_fund']
        open_fund_pool = {}
        open_fund_name_to_id = dict(zip(display_names, names))
        for i in range(len(display_names)):
            display, pool_id = display_names[i], names[i]
            if pool_id != 'QDII_fund':
                p = get_funds[get_funds['type'] == pool_id]
            else:
                p = jqdatasdk.get_all_securities(pool_id)

            q = p.index.values
            id_to_name = dict(zip(p.index.values, p.display_name.values))
            open_fund_name_to_id.update(dict(zip(p.display_name.values, p.index.values)))
            funds = []
            for item in q:
                try:
                    funds.append(id_to_name[item])
                except Exception as e:
                    pass
            funds = sorted(funds, key=lambda x: ' '.join(lazy_pinyin(x)))
            open_fund_pool[display] = funds
        names_to_id['open_fund'] = open_fund_name_to_id

        data = {
            'stock_pool': stock_pool,
            'exchanged_fund_pool': exchanged_fund_pool,
            'open_fund_pool': open_fund_pool,
            'industry_pool': industries,
            'index_pool': indices
        }

        key_name = 'data-' + start_date + '-' + end_date + '.pkl'
        red[key_name] = json.dumps(data)
        red['names_to_id'] = json.dumps(names_to_id)

    key_name = 'data-' + start_date + '-' + end_date + '.pkl'
    if red.get(key_name) is None:
        save_data(start_date, end_date)
    data = red.get(key_name)
    data = json.loads(data)
    return data['stock_pool'], data['industry_pool'], data['index_pool'], data['exchanged_fund_pool'], data[
        'open_fund_pool']


@app.task
def run_get_subject_message(g_code_list, sub_type, g_endTime):
    res = asset_infos.show_assets_info(g_code_list, sub_type=sub_type, date=g_endTime)
    columns = [''] + res.columns.tolist()
    rows = res.values.tolist()
    for i in range(len(rows)):
        rows[i] = [res.index.values[i]] + rows[i]
    data = {
        'columns': columns,
        'dataset': rows
    }
    return data
