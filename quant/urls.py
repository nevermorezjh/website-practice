from django.urls import path

from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('register', views.register, name='register'),
    path('combine', views.combine, name='combine'),
    path('search', views.search, name="search"),
    path('get_stocks', views.get_stocks, name="get-stocks"),
    path('get_restrict_stocks', views.get_restrict, name="get-restrict"),
    path('combine_arrange', views.combine_arrange, name="combine-arrange"),
]