from django.shortcuts import render
from .models import EnergyData
"""import json"""
from django.http import JsonResponse

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def get_data(request):
    data = EnergyData.objects.all().values()
    data_list = list(data)
    return JsonResponse(data_list, safe=False)