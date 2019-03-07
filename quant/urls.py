from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('search', views.search, name="search"),
    path('get_stocks', views.get_stocks, name="get-stocks"),
]