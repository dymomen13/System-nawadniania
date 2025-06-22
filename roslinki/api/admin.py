from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Device, Pomiar

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    ordering = ('username',)
    search_fields = ('username', 'email')

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Uprawnienia', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Daty', {'fields': ('last_login',)}),
    )

    readonly_fields = ('created_at',)

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_superuser', 'is_active')}
        ),
    )

admin.site.register(User, UserAdmin)
admin.site.register(Device)
admin.site.register(Pomiar)
