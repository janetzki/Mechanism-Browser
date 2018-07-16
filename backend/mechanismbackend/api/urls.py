from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt
from . import views
from updown.views import AddRatingFromModel

urlpatterns = [
    url(r'^mechanisms/$', views.MechanismList.as_view()),
    url(r'^mechanisms/(?P<pk>[0-9]+)/$', views.MechanismRetrieveUpdate.as_view()),
    url(r'^mechanisms/create/$', csrf_exempt(views.MechanismCreate.as_view())),
    url(r'^mechanisms/(?P<object_id>\d+)/rate/(?P<score>[\d\-]+)$', AddRatingFromModel(), {
            'app_label': 'api',
            'model': 'Mechanism',
            'field_name': 'rating',
    }),
    url(r'^mechanisms/matrix/$', views.MechanismMatrix.as_view()),

]
