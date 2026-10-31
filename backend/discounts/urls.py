from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscountRuleViewSet

router = DefaultRouter()
router.register(r'discounts', DiscountRuleViewSet, basename='discount')

urlpatterns = [
    path('', include(router.urls)),
]
