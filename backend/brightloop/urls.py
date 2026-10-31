"""
brightloop URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('health', health_check),
    path('health/', health_check),
    path('api/v1/health', health_check),
    path('api/v1/health/', health_check),
    path('admin/', admin.site.urls),
    path('api/v1/', include('accounts.urls')),
    path('api/v1/', include('products.urls')),
    path('api/v1/', include('subscriptions.urls')),
    path('api/v1/', include('invoices.urls')),
    path('api/v1/', include('payments.urls')),
    path('api/v1/', include('discounts.urls')),
    path('api/v1/', include('dashboard.urls')),
]
