from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


# Create your views here.
def index(request):

	return render(request, "index.html")

@csrf_exempt
def search(request):
	if request.method == "POST":
		print(json.loads(request.body.decode('utf-8')))
		print('PPPPOST')
	print(request.POST)
	return HttpResponse("Hello")

def get_stocks(request):
	itemlist = ["沪深300", "中证500", "上证50", "上证180", "创业50", "深证100", "创业300"]
	stockpools = {}
	for item in itemlist:
		stocks = []
		for i in range(30):
			stocks.append(item + '-' + str(i))
		stockpools[item] = stocks
	return JsonResponse(stockpools)