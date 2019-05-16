from django.urls import path

from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('register', views.register, name='register'),
    path('combine', views.combine, name='combine'),
    path('strategy', views.combine, name='strategy'),
    path('blmodel', views.bl_model, name='bl-model'),
    path('search', views.search, name="search"),
    path('get_stocks', views.get_stocks, name="get-stocks"),
    path('combine_arrange', views.combine_arrange, name="combine-arrange"),
]