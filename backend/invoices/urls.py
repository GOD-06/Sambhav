from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaxRuleViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'tax-rules', TaxRuleViewSet, basename='tax-rule')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
