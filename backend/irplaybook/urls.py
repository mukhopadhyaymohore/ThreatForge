# from django.urls import path, include

# urlpatterns = [
#     path('api/', include('api.urls')),
# ]

from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('api/', include('api.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    path('app/', TemplateView.as_view(template_name='app.html')),
]