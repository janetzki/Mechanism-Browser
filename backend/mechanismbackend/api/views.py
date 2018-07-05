from django.db.models import Count
from django.db.models.expressions import RawSQL
from django.db import connection
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Mechanism
from .serializers import MechanismSerializer
from django_filters import rest_framework as filters
from django.db.utils import IntegrityError


class MechanismFilter(filters.FilterSet):
    name = filters.CharFilter(name='name', lookup_expr='icontains')

    class Meta:
        model = Mechanism
        fields = ['id',
                  'name',
                  'transmission',
                  'inputR1',
                  'inputR2',
                  'inputR3',
                  'inputT1',
                  'inputT2',
                  'inputT3',
                  'outputR1',
                  'outputR2',
                  'outputR3',
                  'outputT1',
                  'outputT2',
                  'outputT3']


class MechanismList(generics.ListAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer
    filter_backends = (filters.DjangoFilterBackend,)  # enable filter-backend for this view
    filter_class = MechanismFilter


class MechanismRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer


class MechanismCreate(generics.CreateAPIView):
    serializer_class = MechanismSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super(generics.CreateAPIView, self).create(request, *args, **kwargs)
        except IntegrityError as e:
            content = {'error': str(e)}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class MechanismMatrix(APIView):
    def get(self, request, format=None):
        results = {}
        with connection.cursor() as cursor:
            for h in ['R', 'T']:
                for i in range(1, 4):
                    i = str(i)
                    for j in range(1, 4):
                        j = str(j)
                        cursor.execute('select input'+h+i+', output'+h+j+', Count(*) from api_mechanism group by input'+h+i+', output'+h+j)

                        cols = [col[0] for col in cursor.description]
                        name = ', '.join(cols[:-1])
                        rows = cursor.fetchall()
                        results[name] = rows
        return Response(results)
