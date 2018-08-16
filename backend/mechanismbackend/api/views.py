from django.db import connection
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .paginators import FirstLastPageNumberPaginator
from .models import Mechanism
from .serializers import MechanismSerializer
from django_filters import rest_framework as filters
from django.db.utils import IntegrityError


class MechanismFilter(filters.FilterSet):
    name = filters.CharFilter(name='name', lookup_expr='icontains')
    parametric_model = filters.BooleanFilter(method='parametric_model_defined')

    class Meta:
        model = Mechanism
        fields = ['id',
                  'name',
                  'transmission',
                  'transmission_inverted',
                  'transmission_guessed',
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
                  'parametric_model',
                  'complete']

    def parametric_model_defined(self, queryset, name, defined):
        # https://django-filter.readthedocs.io/en/master/ref/filters.html
        if defined:
            return queryset.exclude(parametric_model='')
        else:
            return queryset.filter(parametric_model='')


class MechanismList(generics.ListAPIView):
    queryset = Mechanism.objects.all()

    def get_queryset(self, **kwargs):
        qs = super(MechanismList, self).get_queryset()
        self.filter = MechanismFilter(self.request.GET, queryset=qs)
        return self.filter.qs

    def list(self, request):
        queryset = self.get_queryset()
        result_list = list(queryset)
        result_list = self.reorder_by_dissimilarity(result_list)
        paginator = FirstLastPageNumberPaginator()
        requested_list = paginator.paginate_list(result_list, request)
        serialized = MechanismSerializer(requested_list, many=True)
        return paginator.get_paginated_response(serialized.data)

    def reorder_by_dissimilarity(self, mechanisms):
        """ Maximize dissimilarities on each page greedily """
        current_position_on_page = 0
        dissimilarities = [0 for m in mechanisms]

        for i in range(len(mechanisms)):
            if i % FirstLastPageNumberPaginator.page_size == 0:
                # start a new page
                dissimilarities = [0 for m in mechanisms]
                current_position_on_page = 1
                continue
            mech_a = mechanisms[i]
            max_dissimilarity = 0

            for k in range(i + 1, len(mechanisms)):
                mech_b = mechanisms[k]
                dissimilarities[k] += mech_a.get_dissimilarity(mech_b)
                dissimilarity = dissimilarities[k] / current_position_on_page

                if dissimilarity > max_dissimilarity:
                    max_dissimilarity = dissimilarity
                    max_dissimilarity_index = k
                    mechanisms[i + 1], mechanisms[max_dissimilarity_index] = mechanisms[max_dissimilarity_index], \
                                                                             mechanisms[i + 1]
            current_position_on_page += 1
        return mechanisms


class MechanismRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
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

                            query = 'SELECT input' + input + i + ', output' + output + o +\
                                ', COUNT(*) FROM api_mechanism ' + predicate + ' group by input' + input + i + ', output' + output + o
                            cursor.execute(query)
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
        """ Create SQL predicate clause for the query. """
        params = list()
        params.append(('inputR1', self.request.query_params.get('inputR1', None)))
        params.append(('inputR2', self.request.query_params.get('inputR2', None)))
        params.append(('inputR3', self.request.query_params.get('inputR3', None)))
        params.append(('inputT1', self.request.query_params.get('inputT1', None)))
        params.append(('inputT2', self.request.query_params.get('inputT2', None)))
        params.append(('inputT3', self.request.query_params.get('inputT3', None)))
        params.append(('outputR1', self.request.query_params.get('outputR1', None)))
        params.append(('outputR2', self.request.query_params.get('outputR2', None)))
        params.append(('outputR3', self.request.query_params.get('outputR3', None)))
        params.append(('outputT1', self.request.query_params.get('outputT1', None)))
        params.append(('outputT2', self.request.query_params.get('outputT2', None)))
        params.append(('outputT3', self.request.query_params.get('outputT3', None)))
        params.append(('complete', self.request.query_params.get('complete', None)))
        params.append(('transmission', self.request.query_params.get('transmission', None)))
        params.append(('transmission_inverted', self.request.query_params.get('transmission_inverted', None)))
        params.append(('transmission_guessed', self.request.query_params.get('transmission_guessed', None)))
        params.append(('parametric_model', self.request.query_params.get('parametric_model', None)))
        params.append(('name', self.request.query_params.get('name', None)))

        set_params = [p + '="' + v + '"' for (p, v) in params if (v is not None and p == 'transmission')]
        set_params += [p + " like '%" + v + "%'" for (p, v) in params if (v is not None and p == 'name')]
        set_params += [p + '<>""' for (p, v) in params if (v is not None and v.lower() == 'true' and p == 'parametric_model')]
        set_params += [p + '=""' for (p, v) in params if (v is not None and v.lower() == 'false' and p == 'parametric_model')]
        set_params += [p + '=1' for (p, v) in params if (v is not None and v.lower() == 'true' and p != 'parametric_model')]
        set_params += [p + '=0' for (p, v) in params if (v is not None and v.lower() == 'false' and p != 'parametric_model')]

        joined = ' and '.join(set_params)
        if joined != '':
            joined = 'WHERE ' + joined
        return joined
