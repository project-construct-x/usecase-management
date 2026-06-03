import pandas as pd
from app.db import engine, SessionLocal
from app.models import models
from sqlalchemy import text
import warnings
import re

warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

file_name = "input/AP1.1_DCT_WIP_Standards_2025-04-29.xlsx"

def read_excel(file_name):
    df_standards = pd.read_excel(
        file_name,
        sheet_name="Standards",
        header=0,
        index_col=False,
        names=['category', 'number', 'title', 'subtitle', 'date', 'keywords', 'link', 'description', 'UC_1', 'UC_2',
               'UC_3', 'UC_4', 'UC_5', 'UC_6', 'UC_8', 'UC_9', 'UC_10', 'UC_11']
    )
    df_standards = df_standards[df_standards['title'].notnull()]
    df_standards = df_standards.fillna("")

    return df_standards

def reset_tables():
    with engine.connect() as conn:
        conn.execute(text('DELETE FROM "useCase_standards"'))
        conn.execute(text("DELETE FROM standards"))
        conn.commit()


def load_ucs(db):
    ucs = db.query(models.UseCase).all()
    uc_by_conx_id = {}
    for uc in ucs:
        if uc.conx_id is not None:
            uc_by_conx_id[int(uc.conx_id)] = uc
    return uc_by_conx_id

def parse_keywords(val):
    if pd.isna(val):
        return []
    parts = re.split(r"[\n,]+", str(val))
    return [p.strip() for p in parts if p.strip()]

def create_standards(df, db):
    standards = []
    uc_columns = ['UC_1', 'UC_2', 'UC_3', 'UC_4', 'UC_5', 'UC_6', 'UC_8', 'UC_9', 'UC_10', 'UC_11']
    uc_ids = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11]
    ucs = load_ucs(db)

    for r in df.itertuples(index=False):
        standard = models.Standard(
            number = str(r.number),
            category = models.StandardCategory(str(r.category.strip())),
            title = str(r.title),
            subTitle= str(r.subtitle),
            date = str(r.date),
            reference_URL = str(r.link),
            keywords = parse_keywords(str(r.keywords)),
            description = str(r.description),
        )

        linked_ucs = []
        for col, uc_id in list(zip(uc_columns, uc_ids)):
            cell_value = getattr(r, col, None)
            if cell_value != "":
                uc = ucs.get(uc_id)
                if uc:
                    linked_ucs.append(uc)

        standard.useCases = linked_ucs
        standards.append(standard)

    return standards


def fill_db(standards, db):
    db.add_all(standards)
    db.commit()

def main():
    df_standards = read_excel(file_name)
    reset_tables()

    db = SessionLocal()
    try:
        standards = create_standards(df_standards, db)
        fill_db(standards, db)
    finally:
        db.close()


if __name__ == "__main__":
    main()