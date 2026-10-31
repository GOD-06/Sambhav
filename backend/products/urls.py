from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, ProductVariantViewSet, SubscriptionPlanViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'product-variants', ProductVariantViewSet, basename='product-variant')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')

urlpatterns = [
    path('', include(router.urls)),
]
