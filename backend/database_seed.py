from app.db import engine, Base, SessionLocal
from app import models


def reset_database():
    """Löscht alle Tabellen und erstellt sie neu"""
    print("🗑️  Lösche alle Tabellen...")

    # PostgreSQL: CASCADE verwenden um abhängige Objekte mitzulöschen
    from sqlalchemy import text
    with engine.connect() as conn:
        # Hole alle Tabellennamen
        result = conn.execute(text("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
        """))
        tables = [row[0] for row in result]

        # Lösche jede Tabelle mit CASCADE
        for table in tables:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
        conn.commit()

    print("✨ Erstelle Tabellen neu...")
    Base.metadata.create_all(bind=engine)

    print("✅ Datenbank wurde zurückgesetzt!")


def seed_data():
    """Fügt Testdaten in die Datenbank ein"""
    db = SessionLocal()

    try:
        print("🌱 Füge Testdaten ein...")

        # -------- Standards --------
        standards = [
            models.Standard(
                number="IEC 61970",
                title="Energy Management System",
                subTitle="Application Program Interface",
                date=None,
                link="https://example.com",
                keywords=["EMS", "SCADA"],
                description="Standard für Energiemanagementsysteme"
            ),
            models.Standard(
                number="IEC 62325",
                title="Market Communications",
                subTitle="Part 351",
                date=None,
                link="https://example.com",
                keywords=["Market", "CIM"],
                description="Standard für Marktkommunikation"
            ),
        ]
        db.add_all(standards)
        db.commit()
        print(f"  ✓ {len(standards)} Standards erstellt")

        # -------- Roles --------
        roles = [
            models.Role(
                name="Netzbetreiber",
                definition="Betreiber des Stromnetzes",
                source=standards[0].id
            ),
            models.Role(
                name="Energielieferant",
                definition="Liefert Energie an Endkunden",
                source=standards[0].id
            ),
            models.Role(
                name="Marktakteur",
                definition="Handelt am Energiemarkt",
                source=standards[1].id
            ),
            models.Role(
                name="Messstellenbetreiber",
                definition="Betreibt Messstellen",
                source=standards[0].id
            ),
        ]
        db.add_all(roles)
        db.commit()
        print(f"  ✓ {len(roles)} Roles erstellt")

        # -------- Use Cases --------
        use_cases = [
            models.UseCase(
                name="Netzzustandsüberwachung",
                keywords=["Monitoring", "Grid", "Real-time"],
                description="Überwachung des aktuellen Netzzustands",
                roles=[roles[0], roles[1]]
            ),
            models.UseCase(
                name="Energiehandel",
                keywords=["Trading", "Market", "Wholesale"],
                description="Handel mit Energieprodukten am Markt",
                roles=[roles[2]]
            ),
            models.UseCase(
                name="Messdatenerfassung",
                keywords=["Metering", "Data", "Smart Meter"],
                description="Erfassung von Verbrauchsdaten",
                roles=[roles[3], roles[0]]
            ),
        ]
        db.add_all(use_cases)
        db.commit()
        print(f"  ✓ {len(use_cases)} Use Cases erstellt")

        # -------- Sub Use Cases --------
        sub_use_cases = [
            models.SubUseCase(
                name="Lastflussberechnung",
                description="Berechnung der Lastflüsse im Netz",
                useCase_id=use_cases[0].id,
                roles=[roles[0]]
            ),
            models.SubUseCase(
                name="Spannungsüberwachung",
                description="Überwachung der Spannungswerte",
                useCase_id=use_cases[0].id,
                roles=[roles[0]]
            ),
            models.SubUseCase(
                name="Intraday-Handel",
                description="Kurzfristiger Energiehandel",
                useCase_id=use_cases[1].id,
                roles=[roles[2]]
            ),
            models.SubUseCase(
                name="Zählerdatenauslesung",
                description="Auslesen der Smart Meter Daten",
                useCase_id=use_cases[2].id,
                roles=[roles[3]]
            ),
        ]
        db.add_all(sub_use_cases)
        db.commit()
        print(f"  ✓ {len(sub_use_cases)} Sub Use Cases erstellt")

        # -------- Transactions --------
        transactions = [
            models.Transaction(
                name="Netzdaten senden",
                subUseCase_id=sub_use_cases[0].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True
            ),
            models.Transaction(
                name="Messwerte übermitteln",
                subUseCase_id=sub_use_cases[3].id,
                roleOut_id=roles[3].id,
                roleIn_id=roles[0].id,
                usesDataspace=False
            ),
            models.Transaction(
                name="Handelsdaten austauschen",
                subUseCase_id=sub_use_cases[2].id,
                roleOut_id=roles[2].id,
                roleIn_id=roles[2].id,
                usesDataspace=True
            ),
        ]
        db.add_all(transactions)
        db.commit()
        print(f"  ✓ {len(transactions)} Transactions erstellt")

        print("\n✅ Alle Testdaten erfolgreich eingefügt!")

    except Exception as e:
        print(f"\n❌ Fehler beim Einfügen der Testdaten: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Hauptfunktion: Reset und Seed"""
    print("=" * 50)
    print("🔄 Datenbank wird zurückgesetzt und neu befüllt")
    print("=" * 50)

    # 1. Datenbank zurücksetzen
    reset_database()

    print()

    # 2. Testdaten einfügen
    seed_data()

    print("\n" + "=" * 50)
    print("🎉 Fertig!")
    print("=" * 50)


if __name__ == "__main__":
    main()