from jqdatasdk import *
from . import user_passwd
from collections import Counter
import datetime
import pandas as pd
import numpy as np

index_dict = {
    '上证指数': '000001.XSHG',
    '深证成指': '399001.XSHE',
    '上证50': '000016.XSHG',
    '沪深300': '000300.XSHG',
    '中证500': '000905.XSHG',
    '中证800': '000906.XSHG',
    '中小板指': '399005.XSHE',
    '创业板指': '399006.XSHE',
    '创业板50': '399673.XSHE'}

industry_dict = dict(zip(
    ['801740', '801020', '801110', '801160', '801060', '801770', '801010',
     '801120', '801750', '801050', '801890', '801170', '801090', '801710',
     '801780', '801040', '801130', '801880', '801180', '801230', '801220',
     '801760', '801200', '801140', '801720', '801080', '801790', '801030',
     '801100', '801190', '801210', '801730', '801070', '801150'],
    ['国防军工I', '采掘I', '家用电器I', '公用事业I', '建筑建材I', '通信I', '农林牧渔I', '食品饮料I',
     '计算机I', '有色金属I', '机械设备I', '交通运输I', '交运设备I', '建筑材料I', '银行I', '钢铁I',
     '纺织服装I', '汽车I', '房地产I', '综合I', '信息服务I', '传媒I', '商业贸易I', '轻工制造I',
     '建筑装饰I', '电子I', '非银金融I', '化工I', '信息设备I', '金融服务I', '休闲服务I', '电气设备I',
     '机械设备I', '医药生物I']
))

asset_type_dict = {
    '股票': 'stock',
    '场内基金': 'exchanged_fund',
    '场外公募基金': 'open_fund',
    '大盘指数': 'index',
    '行业指数': 'industry_index'}

sub_type_dict = {
    '股票': 'stock',
    '大盘指数': 'index',
    '行业指数': 'industry_index',
    '场内ETF': 'etf',
    '场内LOF': 'lof',
    '分级基金A': 'fja',
    '分级基金B': 'fjb',
    '场内货币基金': 'mmf',
    '股票型': 'stock_fund',
    '混合型': 'mixture_fund',
    '债券型': 'bond_fund',
    '货币型': 'money_market_fund',
    'ETF联接': 'fund_fund',
    '封闭式': 'closed_fund',
    '黄金': 'noble_metal_fund',
    'QDII': 'QDII_fund'}

type_name_dict = {v: k for k, v in sub_type_dict.items()}

'''''''''''
sub_type 就是上面 sub_type_dict 里的右边栏目，
如果sub_type 为 'index' 或 'industry_index'时，需要有index代码

'''''''''''


def get_sub_assets(sub_type='etf', date=None, index=None):
    if sub_type == 'index' and index is not None:
        df = get_index_weights(index_id=index, date=date)
        return list(df['display_name'])

    elif sub_type == 'industry_index' and index is not None:
        industry = get_industries(name='sw_l1')
        industry = industry[industry['start_date'] < date]
        if index in list(industry.index):
            codes = get_industry_stocks(industry_code=index, date=date)
            names = [get_security_info(code).display_name for code in codes]
            return names
        else:
            return []

    elif sub_type in ['etf', 'lof', 'fja', 'fjb', 'stock_fund', 'mixture_fund', 'bond_fund', 'money_market_fund',
                      'QDII_fund']:
        df = get_all_securities(types=sub_type, date=date)
        return list(df['display_name'])

    elif sub_type == 'mmf':
        df = get_all_securities(types='fund', date=date)
        df = df[df['type'] == 'mmf']
        return list(df['display_name'])

    elif sub_type in ['fund_fund', 'closed_fund', 'noble_metal_fund']:
        df = get_all_securities(types='open_fund', date=date)
        df = df[df['type'] == sub_type]
        return list(df['display_name'])


def show_assets_info(code_list, sub_type='stock', date=None):
    auth(username=user_passwd.user_name, password=user_passwd.passwd)
    percentage_func = lambda x: "{:.2%}".format(x)
    round_func = lambda x: np.round(x, 2)
    if sub_type == 'stock':
        df = get_fundamentals(query(
            valuation.code,
            valuation.capitalization,
            valuation.circulating_cap,
            valuation.market_cap,
            valuation.circulating_market_cap,
            valuation.turnover_ratio,
            valuation.pe_ratio,
            valuation.pe_ratio_lyr,
            valuation.pb_ratio,
            valuation.ps_ratio,
            valuation.pcf_ratio,
        ).filter(
            valuation.code.in_(code_list)
        ), date=date)

        df.columns = ['股票代码',
                      '总股本（万股）',
                      '流通股本（万股）',
                      '总市值（亿元）',
                      '流通市值（亿元）',
                      '换手率（%）',
                      '市盈率（TTM）',
                      '市盈率（LYR）',
                      '市净率',
                      '市销率',
                      '市现率']
        for item in ['总股本（万股）',
                     '流通股本（万股）',
                     '总市值（亿元）',
                     '流通市值（亿元）', ]:
            df[item] = df[item].apply(round_func)
        for item in ['换手率（%）',
                     '市盈率（TTM）',
                     '市盈率（LYR）',
                     '市净率',
                     '市销率',
                     '市现率']:
            df[item] = df[item].apply(percentage_func)
        industry = get_industry(code_list, date=date)
        df['所属行业'] = [industry[code]['sw_l1']['industry_name'] for code in list(df['股票代码'])]
        names = [get_security_info(code).display_name for code in list(df['股票代码'])]
        df.index = names

    elif sub_type in ['etf', 'lof', 'fja', 'fjb', 'stock_fund', 'mixture_fund', 'bond_fund', 'money_market_fund',
                      'QDII_fund', 'mmf']:
        df = get_all_securities(types=['fund', 'open_fund'], date=date)
        df = df[df.index.isin(code_list)]
        df = df[['display_name', 'start_date', 'type']]
        df['type'] = [type_name_dict[item] for item in df['type']]
        df['start_date'] = list(map(lambda x: str(x)[:10], df['start_date'].values))
        df.columns = ['基金简称', '成立日期', '类型']

    elif sub_type == 'index':
        df = get_all_securities(types=['index'], date=date)
        df = df[df.index.isin(code_list)]
        df = df[['display_name', 'start_date']]
        df['start_date'] = list(map(lambda x: str(x)[:10], df['start_date'].values))
        df.columns = ['简称', '成立日期']

    elif sub_type == 'industry_index':
        df = get_industries(name='sw_l1')
        df = df[df.index.isin(code_list)]
        df = df[['name', 'start_date']]
        df['start_date'] = list(map(lambda x: str(x)[:10], df['start_date'].values))
        df.columns = ['简称', '成立日期']
    return df
