from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^mechanisms/$', views.MechanismList.as_view()),
    url(r'^mechanisms/(?P<pk>[0-9]+)/$', views.MechanismDetail.as_view()),
]
