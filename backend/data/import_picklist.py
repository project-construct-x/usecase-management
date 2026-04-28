import pandas as pd
from app.db import engine, SessionLocal
from app.models import models
from sqlalchemy import text
import warnings
import uuid
from datetime import datetime, timezone

warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

file_name = "input/Picklist-Klassen-und-Merkmale_260422.xlsx"

def read_excel(file_name):
    df_classes = pd.read_excel(
        file_name,
        sheet_name="Klassen",
        header=0,
        names=['ID', 'name', 'definition', 'parents', 'reference', 'used_in', 'relations']
    )
    df_classes = df_classes[df_classes['name'].notnull()]
    df_groups = pd.read_excel(
        file_name,
        sheet_name="Merkmalsgruppen",
        names=['ID', 'name', 'definition', 'parents', 'reference', 'used_in'],
    )
    df_groups = df_groups[df_groups['name'].notnull()]
    df_properties = pd.read_excel(
        file_name,
        sheet_name="Merkmale",
        names=['ID', 'name', 'parents', 'definition', 'description', 'examples', 'physical_quantity', 'unit', 'data_type', 'possible_values', 'reference', 'used_in']
    )
    df_properties = df_properties[df_properties['name'].notnull()]

    return df_classes, df_groups, df_properties

def reset_tables():
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM properties"))
        conn.execute(text('DELETE FROM "propertyGroups"'))
        conn.commit()


def create_classes(df):
    classes = []
    classes_ids = {}
    for r in df.itertuples(index=False):
        group = models.PropertyGroup(
            UUID=uuid.uuid4(),
            active=True,
            date_of_creation=datetime.now(timezone.utc),
            date_of_activation=datetime.now(timezone.utc),
            date_of_change=datetime.now(timezone.utc),
            date_of_revision=datetime.now(timezone.utc),
            date_of_version=datetime.now(timezone.utc),
            version=1,
            number_of_revision=0,
            language_of_creator="de-DE",
            name=r.name,
            definition=r.definition,
            category=models.Category.CLASS,
        )
        classes.append(group)
        classes_ids[r.ID] = group.UUID
    # zweiter Durchlauf, um Parents richtig zu setzen
    for r, group in zip(df.itertuples(index=False), classes):
        if not r.parents:
            continue
        parent_ids = {p.strip() for p in str(r.parents).split(",")}
        group.groups = [classes_ids[parent_id] for parent_id in parent_ids if parent_id in classes_ids]

    return classes, classes_ids

def create_property_groups(df, classes_ids):
    property_groups = []
    property_groups_ids = {}
    for r in df.itertuples(index=False):
        group = models.PropertyGroup(
            UUID=uuid.uuid4(),
            active=True,
            date_of_creation=datetime.now(timezone.utc),
            date_of_activation=datetime.now(timezone.utc),
            date_of_change=datetime.now(timezone.utc),
            date_of_revision=datetime.now(timezone.utc),
            date_of_version=datetime.now(timezone.utc),
            version=1,
            number_of_revision=0,
            language_of_creator="de-DE",
            name=r.name,
            definition=r.definition,
            category=models.Category.DOMAIN,
        )
        property_groups.append(group)
        property_groups_ids[r.ID] = group.UUID

    # zweiter Durchlauf, um Parents richtig zu setzen
    for r, group in zip(df.itertuples(index=False), property_groups):
        if not r.parents:
            continue
        parent_ids = {p.strip() for p in str(r.parents).split(",")}
        group_uuids = []
        for parent_id in parent_ids:
            if parent_id in classes_ids:
                group_uuids.append(classes_ids[parent_id])
            if parent_id in property_groups_ids:
                group_uuids.append(property_groups_ids[parent_id])
        group.groups = group_uuids

    return property_groups, property_groups_ids


def create_properties(df, classes_ids, property_groups_ids):
    properties = []
    for r in df.itertuples(index=False):
        parent_ids = {p.strip() for p in str(r.parents).split(",")}
        group_uuids = []
        for parent_id in parent_ids:
            if parent_id in classes_ids:
                group_uuids.append(classes_ids[parent_id])
            if parent_id in property_groups_ids:
                group_uuids.append(property_groups_ids[parent_id])

        prop = models.Property(
            UUID=uuid.uuid4(),
            active=True,
            date_of_creation=datetime.now(timezone.utc),
            date_of_activation=datetime.now(timezone.utc),
            date_of_change=datetime.now(timezone.utc),
            date_of_revision=datetime.now(timezone.utc),
            date_of_version=datetime.now(timezone.utc),
            version=1,
            number_of_revision=1,
            language_of_creator="de-DE",
            name=r.name,
            definition=r.definition,
            description=r.description,
            examples=r.examples,
            groups=group_uuids,
            symbols=[""],
            used_in_countries=["DE", "AT", "CH", "EU"],
            country_of_origin="DE",
            physical_quantity=[r.physical_quantity],
            dimension="",  # M T^-3 Θ^-1
            measurement_method="",
            data_type=r.data_type,
            dynamic=False,
            units=[r.unit],
            tolerance=[""],
            digital_format=[""],
            limit_values=[r.possible_values],
        )
        properties.append(prop)
    print(properties)
    return properties

def fill_db(classes, properties, property_groups):
    db = SessionLocal()
    db.add_all(classes)
    db.commit()
    db.add_all(property_groups)
    db.commit()
    db.add_all(properties)
    db.commit()
    db.close()

def main():
    df_classes, df_groups, df_properties = read_excel(file_name)
    reset_tables()
    classes, classes_ids = create_classes(df_classes)
    property_groups, property_groups_ids = create_property_groups(df_groups, classes_ids)
    properties = create_properties(df_properties, classes_ids, property_groups_ids)
    fill_db(classes, properties, property_groups)


if __name__ == "__main__":
    main()