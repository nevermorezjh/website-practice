from django.urls import path

from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('register', views.register, name='register'),
    path('allocation', views.allocation, name='allocation'),
    path('backtest', views.backtest, name='backtest'),
    path('get_data', views.get_data, name="get-data"),
    path('allocation_submit', views.allocation_submit, name="allocation-submit"),
    path('backtest_submit', views.backtest_submit, name="backtest-submit"),
    path('get_subject_message', views.get_subject_message, name='get-subject-message'),
]