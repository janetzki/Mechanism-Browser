from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from .models import Mechanism
from .serializers import MechanismSerializer
from django_filters import rest_framework as filters
from django.db.utils import IntegrityError


class MechanismList(generics.ListAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer
    filter_backends = (filters.DjangoFilterBackend,)  # enable filter-backend for this view
    filter_fields = ('id',
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
                     'outputT3',)


class MechanismDetail(generics.RetrieveAPIView):
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


