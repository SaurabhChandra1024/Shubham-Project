from django.contrib import admin
from .models import EnergyData

@admin.register(EnergyData)
class EnergyDataAdmin(admin.ModelAdmin):
    list_display = ('title', 'sector', 'topic', 'country', 'added', 'published')
    search_fields = ('title', 'sector', 'topic', 'country')
    list_filter = ('sector', 'topic', 'country', 'added', 'published')
