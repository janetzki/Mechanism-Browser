from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    url(r'^mechanisms/$', views.MechanismList.as_view()),
    url(r'^mechanisms/(?P<pk>[0-9]+)/$', views.MechanismDetail.as_view()),
    url(r'^mechanisms/create/$', csrf_exempt(views.MechanismCreate.as_view())),
]
