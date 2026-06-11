from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from .. import crud
from ..models.models import PropertyGroup, Property, Category
import re

router = APIRouter(prefix="/ontology", tags=["ontology"])

@router.get("/graph")
def get_ontology_graph(db: Session = Depends(get_db)):
    """
    Gibt alle aktiven PropertyGroups und Properties als Graph zurück.
    Nodes:
        - PropertyGroups vom Typ CLASS  -> type: "class"
        - alle anderen PropertyGroups   -> type: "group"
        - Properties                    -> type: "property"
    Edges:
        - group.groups (GA023)          -> Eltern-Kind-Beziehung zwischen Groups
        - property.groups (PA021)       -> Property gehört zu Group
    """
    groups: list[PropertyGroup] = crud.get_propertyGroups(db)

    properties: list[Property] = crud.get_properties(db)

    nodes = []
    edges = []

    for g in groups:
        is_class = (g.category == Category.CLASS)
        d = dict(part.strip("() ").split(", ", 1) for part in g.name.split("), (")) # workaround as long as values are in database as '(de, [deutsch]), (en, [englisch])'
        nodes.append({
            "id": str(g.UUID),
            "type": "class" if is_class else "propertyGroup",
            "data": {
                "label": d["de"] if "de" in d else d["en"], # alternativ: g.name
                "definition": g.definition,
                "uuid": str(g.UUID),
            }
        })
        # Parent-Edges aus GA23
        if g.groups:
            for parent_uuid in g.groups:
                edges.append({
                    "id": f"e-{parent_uuid}-{g.UUID}",
                    "source": str(parent_uuid),
                    "target": str(g.UUID),
                    "type": "smoothstep",
                })

    for p in properties:
        d = dict(part.strip("() ").split(", ", 1) for part in p.name.split("), ("))  # workaround as long as values are in database as '(de, [deutsch]), (en, [englisch])'
        nodes.append({
            "id": str(p.UUID),
            "type": "property",
            "data": {
                "label": d["de"] if "de" in d else d["en"],
                "definition": p.definition,
                "uuid": str(p.UUID),
            }
        })
        # Property -> Group Kanten aus PA021
        if p.groups:
            for group_uuid in p.groups:
                edges.append({
                    "id": f"e-{group_uuid}-{p.UUID}",
                    "source": str(group_uuid),
                    "target": str(p.UUID),
                    "type": "smoothstep",
                })

    return {"nodes": nodes, "edges": edges}