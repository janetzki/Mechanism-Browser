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
                  'outputT3',
                  'complete']


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


# dirty hack, try to find better way to achieve this
class MechanismMatrix(APIView):
    def get(self, request, format=None):
        predicate = self.get_query_predicate()

        matrix = []
        matrix_inner = []

        with connection.cursor() as cursor:
            for input in ['R', 'T']:
                for i in range(1, 4):
                    i = str(i)
                    for output in ['R', 'T']:
                            for o in range(1, 4):
                                o = str(o)

                                cursor.execute('select input' + input + i + ', output' + output + o + ', Count(*) from api_mechanism ' +
                                               predicate + ' group by input' + input + i + ', output' + output + o)
                                rows = cursor.fetchall()

                                num_mechanisms = 0
                                for tpl in rows:
                                    tpl_in, tpl_out, count = tpl
                                    if tpl_in and tpl_out:
                                        num_mechanisms = count
                                        break

                                matrix_inner.append(num_mechanisms)
                                if output + o == 'T3':
                                    matrix.append(matrix_inner)
                                    matrix_inner = []
        return Response(matrix)

    def get_query_predicate(self):
        params = list()
        params.append(('inputR1', self.request.query_params.get('inputR1', None)))
        params.append(('inputR2', self.request.query_params.get('inputR2', None)))
        params.append(('inputR3',  self.request.query_params.get('inputR3', None)))
        params.append(('inputT1',  self.request.query_params.get('inputT1', None)))
        params.append(('inputT2',  self.request.query_params.get('inputT2', None)))
        params.append(('inputT3', self.request.query_params.get('inputT3', None)))
        params.append(('outputR1', self.request.query_params.get('outputR1', None)))
        params.append(('outputR2', self.request.query_params.get('outputR2', None)))
        params.append(('outputR3', self.request.query_params.get('outputR3', None)))
        params.append(('outputT1', self.request.query_params.get('outputT1', None)))
        params.append(('outputT2', self.request.query_params.get('outputT2', None)))
        params.append(('outputT3', self.request.query_params.get('outputT3', None)))
        params.append(('complete', self.request.query_params.get('complete', None)))
        params.append(('transmission', self.request.query_params.get('transmission', None)))
        params.append(('name', self.request.query_params.get('name', None)))
        
        set_params = [p + '=' + v for (p, v) in params if (v is not None and p == 'transmission')]
        set_params += [p + " like '%" + v + "%'" for (p, v) in params if (v is not None and p == 'name')]
        set_params_true = [p + '=1' for (p, v) in params if (v is not None and v.lower() == 'true')]
        set_params_false = [p + '=0' for (p, v) in params if (v is not None and v.lower() == 'false')]
        set_params += set_params_true + set_params_false
        joined = ' and '.join(set_params)
        if joined != '':
            joined = 'where ' + joined
        return joined
