from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from .models import Mechanism
from .serializers import MechanismSerializer


@csrf_exempt
def mechanism_list(request):
    """
    List all mechanisms, or create a new one.
    """
    if request.method == 'GET':
        mechanisms = Mechanism.objects.all()
        serializer = MechanismSerializer(mechanisms, many=True)
        return JsonResponse(serializer.data, safe=False)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = MechanismSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)


@csrf_exempt
def mechanism_detail(request, pk):
    """
    Retrieve, update or delete a mechanism.
    """
    try:
        mechanism = Mechanism.objects.get(pk=pk)
    except Mechanism.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = MechanismSerializer(mechanism)
        return JsonResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = MechanismSerializer(mechanism, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        mechanism.delete()
        return HttpResponse(status=204)


