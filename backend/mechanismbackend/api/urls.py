from django.conf.urls import url, include
from . import views

urlpatterns = [
    #url(r'^mechanisms/$', 'mechanism_collection')
    url(r'^$', views.api_root),
]