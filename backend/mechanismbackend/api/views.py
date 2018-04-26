from rest_framework import generics
from .models import Mechanism
from .serializers import MechanismSerializer


class MechanismList(generics.ListAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer


class MechanismDetail(generics.RetrieveAPIView):
    queryset = Mechanism.objects.all()
    serializer_class = MechanismSerializer



