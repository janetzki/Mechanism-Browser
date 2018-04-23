from django.conf.urls import url, include
from . import views

urlpatterns = [
    #url(r'^mechanisms/$', 'mechanism_collection'),
    url(r'^mechanisms/$', views.api_root),
    #url(r'^$', views.api_root),
]