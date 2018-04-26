from rest_framework import generics
from .models import Mechanism
from .serializers import MechanismSerializer
from django_filters import rest_framework as filters


class MechanismList(generics.ListAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer
    filter_backends = (filters.DjangoFilterBackend,)  # enable filter-backend for this view
    filter_fields = ('name',
                     'transmission',
                     'inputRotationX',
                     'inputRotationY',
                     'inputRotationZ',
                     'inputTranslationX',
                     'inputTranslationX',
                     'inputTranslationX',
                     'outputRotationX',
                     'outputRotationY',
                     'outputRotationZ',
                     'outputTranslationX',
                     'outputTranslationY',
                     'outputTranslationZ',)


class MechanismDetail(generics.RetrieveAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer



