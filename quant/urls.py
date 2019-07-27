from django.urls import path

from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('register', views.register, name='register'),
    path('combine', views.combine, name='combine'),
    path('strategy', views.strategy, name='strategy'),
    path('search', views.search, name="search"),
    path('get_stocks', views.get_stocks, name="get-stocks"),
    path('get_trades', views.get_trades, name="get-trades"),
    path('combine_submit', views.combine_submit, name="combine-submit"),
    path('strategy_submit', views.strategy_submit, name="strategy-submit"),
    path('combine_arrange', views.combine_arrange, name="combine-arrange"),
]