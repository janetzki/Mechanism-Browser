from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^mechanisms/$', views.mechanism_list),
    url(r'^mechanisms/(?P<pk>[0-9]+)/$', views.mechanism_detail),
]