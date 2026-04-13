import json
import os
import glob
from app.db import engine, SessionLocal
from app.models.models import Role, UseCase, SubUseCase, SubUseCaseRole
import logging
from sqlalchemy import text


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

def get_or_create_role(session, role_name: str) -> Role | None:
    if not role_name or not role_name.strip():
        return None
    role_name = role_name.strip()
    role = session.query(Role).filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name, definition="Fehlt noch", source=None)
        session.add(role)
        session.flush()
        log.info(f"  → Neue Rolle angelegt: '{role_name}'")
    return role


def build_bpmn_index(folder: str) -> dict:
    """Erstellt ein Dict {dateiname: dateipfad} für alle .bpmn Dateien im Ordner"""
    index = {}
    for bpmn_path in glob.glob(os.path.join(folder, "*.bpmn")):
        index[os.path.basename(bpmn_path)] = bpmn_path
    log.info(f"{len(index)} BPMN-Datei(en) gefunden.")
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



def seed_use_case(session, data: dict, filename: str, bpmn_index: dict) -> None:
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
    )
    session.add(use_case)
    session.flush()
    log.info(f"UseCase '{uc_name}' wird angelegt ...")

    uc_roles_added = set()

    for suc_data in data.get("sub_use_cases", []):
        suc_name = suc_data.get("name", "").strip()
        if not suc_name:
            log.warning(f"  SubUseCase ohne Namen übersprungen.")
            continue

        # BPMN-Datei suchen und anhängen
        suc_conx_id = suc_data.get("id")
        bpmn_xml = load_bpmn_for_id(suc_conx_id, bpmn_index)




        sub = SubUseCase(
            name=suc_name,
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


    session.flush()


def seed_folder(folder:str) -> None:
    db = SessionLocal()

    json_files = glob.glob(os.path.join(folder, "*.json"))
    if not json_files:
        log.warning(f"Keine .json Dateien in '{folder}' gefunden.")
        return

    bpmn_index = build_bpmn_index(folder)
    log.info(f"{len(json_files)} Datei(en) gefunden in '{folder}'.")

    for filepath in sorted(json_files):
        filename = os.path.basename(filepath)
        log.info(f"\nVerarbeite: {filename}")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            seed_use_case(db, data, filename, bpmn_index)
        except json.JSONDecodeError as e:
            log.error(f"JSON-Fehler in '{filename}': {e}")
        except Exception as e:
            log.error(f"Fehler bei '{filename}': {e}")
            db.rollback()
            continue

    try:
        db.commit()
        log.info("\nAlle Änderungen erfolgreich gespeichert.")
    except Exception as e:
        db.rollback()
        log.error(f"Commit fehlgeschlagen: {e}")
    finally:
        db.close()


def reset_tables():
    with engine.connect() as conn:
        conn.execute(text('DELETE FROM "subUseCases"'))
        conn.execute(text('DELETE FROM "useCase_roles"'))
        conn.execute(text('DELETE FROM "useCases"'))
        conn.execute(text('DELETE FROM "roles"'))
        conn.execute(text('DELETE FROM "subUseCase_roles"'))
        conn.commit()


if __name__ == "__main__":
    folder = "./input"
    reset_tables()
    seed_folder(folder)