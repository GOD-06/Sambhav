"""
brightloop URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('products.urls')),
    path('api/v1/', include('subscriptions.urls')),
    path('api/v1/', include('invoices.urls')),
    path('api/v1/', include('payments.urls')),
    path('api/v1/', include('discounts.urls')),
    path('api/v1/', include('dashboard.urls')),
]
