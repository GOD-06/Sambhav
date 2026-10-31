from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsStaffUser(BasePermission):
    """Allow access to admin and staff users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'staff')
        )


class IsOwnerOrStaff(BasePermission):
    """
    Customer can only see their own data.
    Staff and admin can see all data.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role in ('admin', 'staff'):
            return True
        # Check if the object has a customer field or user field
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsAdminOnly(BasePermission):
    """Allow access only to admin users. Used for sensitive operations."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsStaffOrReadOnly(BasePermission):
    """
    Admin/Staff have full access.
    Everyone else has read-only access.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.role in ('admin', 'staff')
