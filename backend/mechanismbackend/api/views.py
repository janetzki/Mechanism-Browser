from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response

from .paginators import MyFirstLastPageNumberPaginator
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

    def get_queryset(self, **kwargs):
        qs = super(MechanismList, self).get_queryset()
        self.filter = MechanismFilter(self.request.GET, queryset=qs)
        return self.filter.qs

    def list(self, request):
        queryset = self.get_queryset()
        result_list = list(queryset)
        result_list = self.reorder_by_dissimilarity(result_list)
        paginator = MyFirstLastPageNumberPaginator()
        requested_list = paginator.paginate_list(result_list, request)
        serialized = MechanismSerializer(requested_list, many=True)
        return paginator.get_paginated_response(serialized.data)

    def reorder_by_dissimilarity(self, mechanisms):
        """ Maximize dissimilarities on each page greedily """
        current_position_on_page = 0
        dissimilarities = [ 0 for x in mechanisms ]

        for i in range(len(mechanisms)):
            if i % MyFirstLastPageNumberPaginator.page_size == 0:
                # start a new page
                dissimilarities = [ 0 for x in mechanisms ]
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

