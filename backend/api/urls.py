from django.urls import path
from .views import GeneratePlaybookView, ClassifyIncidentView

urlpatterns = [
    path('generate/', GeneratePlaybookView.as_view(), name='generate'),
    path('classify/', ClassifyIncidentView.as_view(), name='classify'),
]