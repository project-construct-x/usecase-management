from app.db import engine, Base, SessionLocal
from app import models
from datetime import datetime, timezone
import uuid


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

        # -------- Property Group ---------
        property_groups = [
            models.PropertyGroup(
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
                name="Allgemeine Infos",
                definition="Allgemeine Informationen zu einem Bauprodukt",
                category=models.Category.DOMAIN,
            ),
            models.PropertyGroup(
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
                name="Doppelboden",
                definition="Bauprodukt Doppelboden",
                category=models.Category.CLASS,
            ),
            models.PropertyGroup(
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
                name="ESPR",
                definition="Merkmale, die in der ESPR definiert werden.",
                category=models.Category.REFERENCE_DOCUMENT,
            )
        ]
        db.add_all(property_groups)
        db.commit()
        print(f"  ✓ {len(property_groups)} Merkmalsgruppen erstellt")

        # -------- Properties --------
        properties = [
            models.Property(
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
                name="Wärmedurchgangskoeffizient",
                definition="Der Wärmedurchgangskoeffizient gibt an, welcher Wärmestrom durch eine Fläche von 1 m² fließt, wenn auf beiden Seiten ein Temperaturunterschied von 1 Kelvin herrscht.",
                description="Der U-Wert ist ein Maß für den Wärmeverlust durch ein Bauteil. Je kleiner der U-Wert, desto besser die Wärmedämmung.",
                examples="Außenwand: 0,24 W/(m²·K), Fenster: 1,3 W/(m²·K), Dach: 0,20 W/(m²·K)",
                groups=[property_groups[0].UUID, property_groups[2].UUID],
                symbols=["U"],
                used_in_countries=["DE", "AT", "CH", "EU"],
                country_of_origin="DE",
                physical_quantity=["Wärmedurchgangskoeffizient"],
                dimension="1 0 -3 -1 0 0 0",  # M T^-3 Θ^-1
                measurement_method="nach DIN EN ISO 6946 oder DIN 4108-4",
                data_type="reell",
                dynamic=False,
                units=["W/(m²·K)"],
                tolerance=["±0.01"],
                digital_format=["1E-2", "W/(m²·K)"],
                limit_values=["(0.1, 5.0)"],
            ),
            models.Property(
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
                name="Herstellername",
                definition=".",
                description="Der U-Wert ist ein Maß für den Wärmeverlust durch ein Bauteil. Je kleiner der U-Wert, desto besser die Wärmedämmung.",
                examples="Außenwand: 0,24 W/(m²·K), Fenster: 1,3 W/(m²·K), Dach: 0,20 W/(m²·K)",
                groups=[property_groups[0].UUID, property_groups[2].UUID],
                symbols=["U"],
                used_in_countries=["DE", "AT", "CH", "EU"],
                country_of_origin="DE",
                physical_quantity=["Wärmedurchgangskoeffizient"],
                dimension="1 0 -3 -1 0 0 0",  # M T^-3 Θ^-1
                measurement_method="nach DIN EN ISO 6946 oder DIN 4108-4",
                data_type="reell",
                dynamic=False,
                units=["W/(m²·K)"],
                tolerance=["±0.01"],
                digital_format=["1E-2", "W/(m²·K)"],
                limit_values=["(0.1, 5.0)"],
            ),

        ]
        db.add_all(properties)
        db.commit()
        print(f"  ✓ {len(properties)} Merkmale erstellt")

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