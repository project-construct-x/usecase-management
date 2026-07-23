import json
import os
import glob
import warnings
from app.db import engine, SessionLocal
from app.models.models import Role, UseCase, SubUseCase, SubUseCaseRole, Transaction
import logging
import pandas as pd
from sqlalchemy import text

warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

'''
alembic revision --autogenerate -m "[betreff]"
alembic upgrade head

'''


# Root logger → Datei
logging.basicConfig(
    filename="import.log",
    filemode="w",
    level=logging.INFO,
    format="%(levelname)s: %(name)s - %(message)s"
)

# SQLAlchemy logs aktiv lassen, aber nur WARNING+
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.dialects").setLevel(logging.WARNING)

# wichtig: propagation aktiv lassen
logging.getLogger("sqlalchemy").propagate = True

log = logging.getLogger(__name__)

def get_or_create_role(session, role_name: str) -> Role | None:
    if not role_name or not role_name.strip():
        return None
    role_name = role_name.strip().split()[0]
    role = session.query(Role).filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name, definition="Fehlt noch", source=None, updated_by="system")
        session.add(role)
        session.flush()
        log.info(f"  → Neue Rolle angelegt: '{role_name}'")
    return role


def to_bool(value):
    if value is None:
        return False
    return str(value).strip().lower() in ["ja", "true", "1", "yes"]


def build_bpmn_index(folder: str) -> dict:
    """Erstellt ein Dict {dateiname: dateipfad} für alle .bpmn Dateien im Ordner"""
    index = {}
    for bpmn_path in glob.glob(os.path.join(folder, "*.bpmn")):
        index[os.path.basename(bpmn_path)] = bpmn_path
    log.info(f"{len(index)} BPMN-Datei(en) gefunden.")
    return index


def build_transaction_index(folder: str) -> dict:
    """Erstellt ein Dict {dateiname: dateipfad} für alle """
    index = {}
    for xlsx_path in glob.glob(os.path.join(folder, "*.xlsx")):
        index[os.path.basename(xlsx_path)] = xlsx_path
    log.info(f"{len(index)} Transaktionstabelle(n) in {folder} gefunden.")
    return index


def load_bpmn_for_id(suc_conx_id, bpmn_index: dict):
    if not suc_conx_id:
        return None
    for filename, path in bpmn_index.items():
        if suc_conx_id in filename:
            with open(path, "r", encoding="utf-8") as f:
                log.info(f"    -> BPMN geladen: '{filename}'")
                return f.read()
    return None


def seed_transactions(suc_conx_id, transactions_index: dict, sub_id, session):
    if not suc_conx_id:
        return None
    for filename, path in transactions_index.items():
        if suc_conx_id in filename:
            log.info(f"Transaktionstabelle für Sub Use Case {suc_conx_id} gefunden.")
            df_transactions, df_transactions_properties = read_transaction_table(path)
            for r in df_transactions.itertuples(index=False):
                role_out = get_or_create_role(session, r.role_out)
                role_in = get_or_create_role(session, r.role_in)
                # log.info(f"Role_out: {role_out}; Role_in: {role_in}")
                transaction = Transaction(
                    process_number=r.number,
                    name=r.name,
                    subUseCase_id=sub_id,
                    roleOut_id=role_out.id,
                    roleIn_id=role_in.id,
                    usesDataspace=to_bool(r.uses_dataspace),
                    related_class_id=r.related_class,
                    data_carrier=r.data_carrier,
                    dataformat_available=r.dataformat_available,
                    dataformat=r.dataformat,
                    timing=r.timing,
                    policies=r.policies,
                    data_size=r.data_size,
                    updated_by="system"
                )
                session.add(transaction)
                session.flush()
                log.info(f"Transaktion mit Nummer {r.number} angelegt.")


def read_transaction_table(filename):
    df_transactions = pd.read_excel(
        filename,
        sheet_name="Transaktionen-Datenpakete",
        header=2,
        names=['number', 'name', 'related_class', 'data_carrier', 'role_out', 'role_in', 'uses_dataspace',
               'dataformat_available', 'dataformat', 'timing', 'policies', 'data_size'],
    )
    df_transactions_properties = pd.read_excel(
        filename,
        sheet_name="Transaktionen-Merkmale",
        header=2,
        names=['number', 'name', 'class_sphere', 'class', 'prop_name','prop_group', 'prop_definition', 'prop_description',
               'prop_example', 'prop_physical_quantity', 'prop_unit', 'prop_datatype', 'prop_possible_values',
               'prop_reference', 'prop_source']
    )
    df_transactions_properties = df_transactions_properties[df_transactions_properties['name'].notnull()]
    df_transactions = df_transactions[df_transactions['name'].notnull()]
    return df_transactions, df_transactions_properties


def seed_use_case(session, data: dict, filename: str, bpmn_index: dict, transaction_index: dict) -> None:
    general = data.get("general", {})

    uc_name = general.get("name", "").strip()
    if not uc_name:
        log.warning(f"Überspringe '{filename}': kein Name in 'general.name'")
        return

    # UseCase überspringen, wenn bereits vorhanden
    existing_uc = session.query(UseCase).filter_by(name=uc_name).first()
    if existing_uc:
        log.info(f"UseCase '{uc_name}' bereits vorhanden – wird gelöscht und neu angelegt.")
        session.delete(existing_uc)
        session.flush()

    # Keywords: kommagetrennte Zeichenkette -> Liste
    keywords_raw = general.get("keywords", "")
    keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]

    use_case = UseCase(
        name=uc_name,
        keywords=keywords,
        description=general.get("description", "").strip() or None,
        relation_to_other_useCases=general.get("relation_to_other_ucs", "").strip() or None,
        uc_owner_institution=general.get("uc_owner_institution", "").strip() or None,
        uc_owner=general.get("uc_owner", "").strip() or None,
        conx_id=general.get("id", "").strip() or None,
        updated_by="system"
    )
    session.add(use_case)
    session.flush()
    log.info(f"UseCase '{uc_name}' wird angelegt ...")

    uc_roles_added = set()

    for suc_data in data.get("sub_use_cases", []):
        suc_name = suc_data.get("name", "").strip()
        if not suc_name:
            log.warning("  SubUseCase ohne Namen übersprungen.")
            continue

        # BPMN-Datei suchen und anhängen
        suc_conx_id = suc_data.get("id")
        bpmn_xml = load_bpmn_for_id(suc_conx_id, bpmn_index)

        sub = SubUseCase(
            name=suc_name,
            conx_id=(suc_data.get("id") or "").strip() or None,
            short_name=(suc_data.get("short_name") or "").strip() or None,
            description=(suc_data.get("description") or "").strip(),
            useCase_id=use_case.id,
            bpmn_xml=bpmn_xml,
            objective=(suc_data.get("objective") or "").strip() or None,
            inputs=(suc_data.get("inputs") or "").strip() or None,
            outputs=(suc_data.get("outputs") or "").strip() or None,
            potential_risks=(suc_data.get("potential_risks") or "").strip() or None,
            distinction_from_other_sucs=(suc_data.get("distinction_to_other_sucs") or "").strip() or None,
            dependency_of_other_sucs=(suc_data.get("dependency_of_other_sucs") or "").strip() or None,
            assumptions=(suc_data.get("assumptions") or "").strip() or None,
            updated_by="system"
        )
        session.add(sub)
        session.flush()
        log.info(f"  SubUseCase '{suc_name}' angelegt.")

        # Rollen aus motivation_by_role und monetary_benefit_by_role zusammenführen
        motivation_map: dict[str, dict] =  {}
        for entry in suc_data.get("motivation_by_role", []):
            role_name = (entry.get("role") or "").strip().replace("-", "")
            if role_name:
                motivation_map[role_name] = {
                    "motivation": (entry.get("motivation") or "").strip() or None,
                    "goal": (entry.get("goal") or "").strip() or None,
                }

        monetary_map: dict[str, str] = {}
        for entry in suc_data.get("monetary_benefit_by_role", []):
            role_name = (entry.get("role") or "").strip().replace("-", "")
            if role_name:
                monetary_map[role_name] = (entry.get("monetary_benefit") or "").strip() or None

        all_role_names = set(motivation_map.keys()) | set(monetary_map.keys())

        for role_name in all_role_names:
            role = get_or_create_role(session, role_name)
            if not role:
                continue

            suc_role = SubUseCaseRole(
                subUseCase_id=sub.id,
                role_id=role.id,
                motivation=motivation_map.get(role_name, {}).get("motivation"),
                goal=motivation_map.get(role_name, {}).get("goal"),
                monetary_benefit=monetary_map.get(role_name),
            )
            session.add(suc_role)

            if role.id not in uc_roles_added:
                if role not in use_case.roles:
                    use_case.roles.append(role)
                uc_roles_added.add(role.id)

        # Transaktionen für Sub Use Case hinzufügen
        seed_transactions(suc_conx_id, transaction_index, sub.id, session)

    session.flush()


def seed_folder(folder:str) -> None:
    json_files = glob.glob(os.path.join(folder, "*.json"))
    if not json_files:
        log.warning(f"Keine .json Dateien in '{folder}' gefunden.")
        return

    bpmn_index = build_bpmn_index(folder)
    transaction_index = build_transaction_index(os.path.join(folder, "transactions"))
    log.info(f"{len(json_files)} JSON-Datei(en) gefunden in '{folder}'.")

    for filepath in sorted(json_files):
        filename = os.path.basename(filepath)
        log.info(f"\nVerarbeite: {filename}")

        db = SessionLocal()
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            seed_use_case(db, data, filename, bpmn_index, transaction_index)
            db.commit()
            log.info(f"{filename}: committed")
        except Exception as e:
            log.error(f"Fehler bei '{filename}': {e}")
            db.rollback()
        finally:
            db.close()


def reset_tables():
    with engine.connect() as conn:
        conn.execute(text('DELETE FROM "transactions"'))
        conn.execute(text('DELETE FROM audit_log WHERE table_name = :table'), {"table": "transactions"})
        conn.execute(text('DELETE FROM "subUseCases"'))
        conn.execute(text('DELETE FROM audit_log WHERE table_name = :table'), {"table": "subUseCases"})
        conn.execute(text('DELETE FROM "useCase_standards"'))
        conn.execute(text('DELETE FROM "useCase_roles"'))
        conn.execute(text('DELETE FROM "useCases"'))
        conn.execute(text('DELETE FROM audit_log WHERE table_name = :table'), {"table": "useCases"})
        conn.execute(text('DELETE FROM "roles"'))
        conn.execute(text('DELETE FROM audit_log WHERE table_name = :table'), {"table": "roles"})
        conn.execute(text('DELETE FROM "subUseCase_roles"'))
        conn.commit()


if __name__ == "__main__":
    folder = "./input"
    reset_tables()
    seed_folder(folder)