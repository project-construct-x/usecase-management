from datetime import datetime

def set_creation_timestamps(obj):
    """Setzt alle Timestamps beim Erstellen"""
    now = datetime.now()
    obj.date_of_activation = now
    obj.date_of_change = now
    obj.date_of_revision = now
    obj.date_of_version = now
    return obj