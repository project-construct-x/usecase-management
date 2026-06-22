import copy
from sqlalchemy.inspection import inspect
from ..models import models
from typing import Iterable, Any

def build_snapshot(
        obj: Any,
        include_fields: Iterable[str] | None = None,
        exclude_fields: Iterable[str] | None = None,
) -> dict:
    mapper = inspect(obj.__class__)
    column_names = [attr.key for attr in mapper.column_attrs]

    if include_fields is not None:
        fields = [f for f in include_fields if f in column_names]
    else:
        fields = column_names

    if exclude_fields:
        exclude_set = set(exclude_fields)
        fields = [f for f in fields if f not in exclude_set]

    snapshot = {}
    for field in fields:
        value = getattr(obj, field)
        snapshot[field] = copy.deepcopy(value)

    return snapshot


def create_audit_log(table_name, record_id, current_user, old_data, new_data, action="updated"):
    log = models.AuditLog(
        table_name=table_name,
        record_id=record_id,
        action=action,
        changed_by=current_user,
        old_data=old_data,
        new_data=new_data,
    )
    return log