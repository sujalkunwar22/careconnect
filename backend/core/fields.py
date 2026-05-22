from rest_framework import serializers

class SupabaseImageField(serializers.ImageField):
    """
    Serializer field that returns the absolute Supabase URL untouched if 
    the underlying database field holds a URL starting with http:// or https://.
    Otherwise, defaults to standard DRF ImageField behavior.
    """
    def to_representation(self, value):
        if not value:
            return None
        name_str = str(value.name)
        if name_str.startswith('http://') or name_str.startswith('https://'):
            return name_str
        return super().to_representation(value)


class SupabaseFileField(serializers.FileField):
    """
    Serializer field that returns the absolute Supabase URL untouched if 
    the underlying database field holds a URL starting with http:// or https://.
    Otherwise, defaults to standard DRF FileField behavior.
    """
    def to_representation(self, value):
        if not value:
            return None
        name_str = str(value.name)
        if name_str.startswith('http://') or name_str.startswith('https://'):
            return name_str
        return super().to_representation(value)
