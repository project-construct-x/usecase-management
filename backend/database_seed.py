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
                name="Bauherrschaft",
                definition="Bauherrin oder Bauherr ist die- oder derjenige: die/der selbst oder durch Dritte, im eigenen Namen oder auf eigene Verantwortung, für eigene oder fremde Rechnung, ein Bauvorhaben – wirtschaftlich und technisch vorbereitet und durchführt, bzw. vorbereiten und durchführen lässt.“[1] Weiter ist die oder der Bauherr jener die/der „zur Vorbereitung und Ausführung eines genehmigungsbedürftigen Bauvorhabens eine Entwurfsverfasserin oder einen Entwurfsverfasser (§ 54), Unternehmerinnen oder Unternehmer (§ 55) und eine Bauleiterin oder einen Bauleiter (§ 56)“[2] beauftragt. „Die Bauherrin oder der Bauherr hat gegenüber der Bauaufsichtsbehörde die nach den öffentlich-rechtlichen Vorschriften erforderlichen Anzeigen und Nachweise zu erbringen, soweit hierzu nicht die Bauleiterin oder der Bauleiter verpflichtet ist",
                source=standards[0].id
            ),
            models.Role(
                name="Eigentümer:in",
                definition="„Eigentum (materielles) ist nach § 903 BGB die Herrschaftsbeziehung einer natürlichen Person oder juristischen Person über eine Sache, mit der der Eigentümer nach seinem eigenen Belieben verfahren und Einwirkungen Dritter ausschließen kann und die selbstverständlich auch staatliche Stellen – beispielsweise in Falle einer beabsichtigten Enteignung – zu achten haben“[1]",
                source=standards[0].id
            ),
            models.Role(
                name="Projektsteuer:in",
                definition="Das Leistungsbild der Projektsteuerung umfasst die Leistungen von Auftragnehmern, die Funktionen des Auftraggebers bei der Steuerung von Projekten mit mehreren Fachbereichen in Stabsfunktion übernehmen“[1] ",
                source=standards[1].id
            ),
            models.Role(
                name="Objektplaner:in",
                definition="Leistungen zur Erbringung von Planungsleistungen i.S. des Entwurfsverfassers[1], hier i.d.R. Architektenleistungen, zum Erbringen von Planungsleistungen nach dem Leistungsbild der Anlage 10 (zu §34 Absatz 4, §35 Absatz 7) der HOAI 2021.",
                source=standards[0].id
            ),
            models.Role(
                name="Generalunternehmer:in",
                definition="Ein Generalübernehmer (GÜ) ist ein Unternehmen, das ein Bauprojekt für den Auftraggeber komplett umsetzt, aber selbst keine Bauleistungen ausführt sondern Nachunternehmer nutzt. Er Fungiert als Bauherr und delegiert Gewerke / Bauabschnitte an Unterauftragsnehmer (Fasade, Elektrik, Klima, ...), z.B. ARGE legal Entity, wird von verschiedenen legal Entities für ein Bauprojekt gegründet.",
                source=standards[0].id
            ),
            models.Role(
                name="Bauprodukthersteller:in",
                definition="Nach der Legaldefinition des Artikels 2, Ziffer 19 BauPVO ist Hersteller jede natürliche oder juristische Person, die ein Bauprodukt herstellt beziehungsweise entwickeln oder herstellen lässt und dieses Produkt unter ihrem eigenen Namen oder ihrer eigenen Marke vermarktet. Im Unterschied zu anderen EU-Regelungen wie z.B. der EU-Verordnung (Verordnung (EG) Nr. 1907/2006 vom 18.12.2006) zur Registrierung, Bewertung, Zulassung und Beschränkung chemischer Stoffe (REACH) muss der Hersteller gemäß BauPVO weder seinen Sitz noch seine Produktion innerhalb der EU haben.",
                source=standards[0].id
            ),
        ]
        db.add_all(roles)
        db.commit()
        print(f"  ✓ {len(roles)} Roles erstellt")

        # -------- Use Cases --------
        use_cases = [
            models.UseCase(
                name="Optimale Lieferantenauswahl",
                keywords=["Lieferantenauswahl", "Prozessoptimierung", "international"],
                description="In der Planungsphase eines Projekts wird die Komplexität, Effizienz und Resilienz des projektspezifischen Wertschöpfungsnetzwerks bestimmt. Mit der Nutzung von Geschäftspartnerdaten und multikriteriellen Bewertungsservices soll ein effizientes Supply Chain Managements des Projekts bereits in der Planungsphase etabliert werden. Die Lösung soll im Anlagenbau und Gewerbebau demonstriert werden und eine entsprechende Business-Applikation entwickelt werden",
                roles=[roles[0], roles[1]]
            ),
            models.UseCase(
                name="Supply Chain / Logistikmanagement",
                keywords=["Logistik", "Prozessoptimierung", "international"],
                description="Das Management der Logistik von Bauvorhaben stellt insbesondere im Anlagenbau eine hohe Herausforderung dar. Projektspezifische Wertschöpfungsnetze mit einer höchster Materialdiversität (von Anlagenkomponenten bis zu Rohstoffen des Bauwerks) müssen global gemanaged werden und auf den Baufortschritt hin adaptiert werden. Ein Digitaler Supply Chain Zwilling mit Simulations-fähigkeit soll Transparenz schaffen und Entscheidungen unterstützen. Hierzu sollen über ein föderiertes Datenökosystem relevante Planungsdaten (bspw. Bestandsinformationen, Bauteil-/ Modulinformationen, Ablaufplanung der Baustelle, etc.) zwischen den beteiligten Partnern ausgetauscht werden, um mit der Methode der Simulation die Logistik-Performance zu evaluieren, Maßnahmen zu bewerten, um eine kostenoptimale und ökologische Logistik und sichere Versorgung der Baustelle zu gewährleisten. Die industriellen Use Case-Partner decken hier optimale das Szenario ab, in welchem bspw. TK Uhde als Versender und LS Cargo, Contrans und die Bremer Lloyd für den Transport und die Verpackung der Güter fungieren. Die Hinzunahme echtzeit-naher Informationen aus dem Materialfluss mit Edge-Computing, insbes. zur Datenreduktion, ist erforderlich. Dies kann bspw. Smarte Kameratechnologie zur Verfügbarkeitsbeurteilung von Abladestellen oder smarte Sensorik zum Alerting bei Beschädigungsrisiken während des Transports beinhalten.",
                roles=[roles[2]]
            ),
            models.UseCase(
                name="KI-gestütztes Risikomanagement",
                keywords=["KI", "Logistik"],
                description="Es gibt zahlreiche öffentliche Quellen, die über mögliche Risiken informieren. (Generative) KI / Large Language Models wie ChatGPT sollen hier genutzt werden, um eine automatisierte Vorfilterung vorzunehmen. Es soll eine automatisierte Interpretation der Relevanz von Newsfeeds von Risikoplattformen und sonstigen öffentlichen Daten durchgeführt werden. Relevante Risiken können dann im Sinn des proaktiven Risikomanagements unter Einsatz des simulationsfähigen digitalen Zwillings auf Ihre Wirkung für das Projekt bzw. Bauvorhaben hin analysiert und kollaborativ im Netzwerküber alle Entitäten hinweg bewertet werden. Entsprechende Maßnahmen können im Anschluss gemeinsam eingeleitet werden, um die Lieferkette aufrechtzuerhalten und somit den Zeitplan des Bauvorhabens nicht zu gefährden.",
                roles=[roles[3], roles[0]]
            ),
            models.UseCase(
                name="Vernetzte Planung",
                keywords=["Planung", "Baustelle", "Architektur"],
                description="Der Dialog zwischen Design und Vorfertigung soll durch einen vertrauensvollen Datenaustausch unterstützt werden. In der Designphase können Restriktionen in Bezug auf die räumlichen Dimensionen und die Kompatibilität von Anschlüssen berücksichtigt werden, sodass mehr vorgefertigte Elemente genutzt werden können. Gleichzeitig kann der hierdurch generierte Informationsaustausch die Produktionsplanung und damit die Auslastung verbessern, was weitere Kostenvorteile generieren kann.",
                roles=[roles[4], roles[1]]
            ),
            models.UseCase(
                name="Baupreisermittlung",
                keywords=["Kosten", "Baustelle", "Planung"],
                description="Die Ermittlung des Angebotspreises erfolgt anhand eines erstellten LV. Eine LV-Position kann jedoch unterschiedliche Leistungsansätze und Örtlichkeiten haben. Ziel ist es als erstes am 3D-Modell den Bauablauf zu simulieren. Danach für jede einzelne Aktivität das Budget zu ermitteln und dann insgesamt zu optimieren.",
                roles=[roles[5], roles[2]]
            ),
            models.UseCase(
                name="Bauablaufplanung",
                keywords=["Baustelle", "Logistik", "Prozessoptimierung"],
                description="Auf der Baustelle erfolgt eine Lean Planung am BIM-Modell. Es werden die verfügbaren Ressourcen als Eingangsgröße hinterlegt. Es werden die erforderlichen Schnittstellen zu Lieferungen und Abstimmungen mit den am Bau Beteiligten über Konnektoren zur Verfügung gestellt. Es ist immer eine Information zum Stand der Baustelle am Ende der Woche verfügbar ",
                roles=[roles[0], roles[2], roles[5]]
            ),
            models.UseCase(
                name="Digitale Leistungsmeldung als Basis für Baustellencontrolling und Baufortschrittskontrolle",
                keywords=["Baustelle", "Logistik"],
                description="Leistungsmeldung / Baustellencontrolling = Baufortschrittskontrolle\n• Erfassung von Prozessen auf der Baustelle: Identifikation von Baumaschinen, Werkzeug, Personal, Tätigkeiten, Material durch den Einsatz von Sensorik (optische, akustische Sensoren; Barcodes, RFID-Tracker, …) und Applikationen (Text- oder Spracheingaben / Fotos / Fertigmeldung / Bautagebuch)\n• Unterscheidung zwischen Errichtung/Montage eines Bauteils/Anlage und entsprechender Abnahme bei der Zustandsmeldung\n• Vorverarbeitung von Sensor- und Applikationsdaten\n• Abgleich der vorverarbeiteten Daten mit den Soll-Daten\n• Report der Lücke zwischen Ist- und Soll-Daten an Bauleiter, Vorarbeiter, Vorfertiger, Lieferanten,\n• Ermittlung des Rest to go (RTG) inklusive Ressourcen und Zeit…",
                roles=[roles[3], roles[2], roles[5], roles[1]]
            ),
            models.UseCase(
                name="ESG-Dokumentation und Umweltberichterstattung",
                keywords=["Baustelle", "ESG", "Nachhaltigkeit"],
                description="Eine valide und vollständige Bereitstellung von Daten zu Umweltwirkungen erfordert sowohl produkt- wie auch prozessspezifische Kennwerte aus der gesamten Prozesskette des Planens, Produzierens, Bauens, Betreibens und Rückbauens.-Während die produktbezogenen Daten das Handlungs- und Entscheidungsfundament für eine nachhaltige Bau- und Betriebsweise bilden, sind es vor allem die prozessbedingten in denen ein Großteil des wettbewerblichen Unterschieds entsteht. Dafür müssen von vielen Prozessbeteiligten Daten vernetzt und intelligent ausgewertet werden.-Gerade die prozessbedingten Daten, die für ESG in großem Umfang kennwertorientiert reguliert und erfasst werden müssen, sprechen im besonderen Maß Edge-Prozesse als sensorbasierte Daten an, welche dezentral zu den erforderlichen Kennwerten aggregiert, umgewandelt und weitergegeben werden müssen.",
                roles=[roles[0], roles[2], roles[4]]
            ),
            models.UseCase(
                name="Erstellung von Materialdatenpässen",
                keywords=["Baustelle", "ESG", "Nachhaltigkeit", "DPP"],
                description="Ziel des Use Cases ist es Materialdatenpässe zu erstellen. Hierbei werden zunächst die Informationsanforderungen in Bezug auf die Erstellung von Materialdatenpässen, unter Berücksichtigung aktuellen politischer Entwicklungen definiert. Der Schwerpunkt wird auf die Berechnung des carbon footprint, den Schadstoffgehalt und die Zirkularität der Bauprodukte gelegt. Im Ergebnis wird eine Merkmalbibliothek für Bauprodukte entstehen, deren Datenmodell im Rahmen von AP1 aufgebaut wird und im bSDD von buildingSMART International gehostet wird.Produzierende Unternehmen werden somit in die Lage versetzt, die für den Materialdatenpass benötigten Datensätze zu Produkteigenschaften für deren Baustoffe und Bauteile digital bereitzustellen.Insbesondere für die Ermittlung des carbon footprint entlang von Lieferketten ist es erforderlich auch die Produktions-, Transport, und Einbau-Informationen zu erfassen. Sog. Trackinginformationen sollen u.a. über den EPCIS-Standard zum Austausch von Prozessereignisdaten zwischen Geschäftspartnern bereitgestellt werden.Sämtliche Daten werden mit dem Connector des Datenraums verknüpft. Im Ergebnis entstehen digitale Materialdatenpässe, die über Madaster und die Entwicklung eines Digital Product Passports (DPP) abgebildet werden. Die Visualisierung der Ergebnisse wird über Edge-Devices auf der Baustelle umgesetzt.Durch die Berücksichtigung weiterer Daten im Gebäudebetrieb werden die Materialdatenpässe in Gebäuderessourcenpässe überführt (Schnittstelle zum UC 1.2)",
                roles=[roles[0], roles[1], roles[2], roles[3], roles[4], roles[5]]
            ),
            models.UseCase(
                name="Baustellenautomatisierung",
                keywords=["Baustelle", "Robotik", "Prozessoptimierung", "Baustelle"],
                description="Prozesse auf der Baustelle (teil)autonom durchführen. Beispiel: Die Verdichtung einer ungebundenen Schicht. Vorgehensweise: Der Frostschutz ist eingebaut und der Fertiger meldet dies der Rüttelplatte. Diese bekommt den Bereich übermittelt und fragt die Qualitätsdaten und Vorgaben ab. Es erfolgt die Verdichtung und die erreichten Qualitätsparameter werden übermittelt. Nach Abschluss der Arbeiten fragt die Rüttelplatte nach dem nächsten Auftrag.\n• automatisierte und autonome Prozesse auf der Baustelle\n• Erfassung des aktuellen Zustandes auf der Baustelle in Echtzeit – Erweiterung des AwF Leistungsmeldung um die Echtzeitkomponente (wo sind welche Maschinen, was ist fertig gestellt, welches Material ist vorhanden, liegt eine Gefährdung vor,um autonom zu bauen?) \n• Modellierung des zu bauenden Prozesses anhand des IST-Zustandes und des vorausliegenden Bausolls mit den beteiligten Maschinen und Materialien\n• Kommunikation mit den Beteiligten Maschinen und Materialien in Echtzeit undAbgleich der geplanten Prozesse\n• Durchführung von assistierenden Prozessen\n• Durchführung von automatisierten Prozessen",
                roles=[roles[0], roles[3], roles[4], roles[5]]
            ),
        ]
        db.add_all(use_cases)
        db.commit()
        print(f"  ✓ {len(use_cases)} Use Cases erstellt")

        # -------- Sub Use Cases --------
        sub_use_cases = [
            models.SubUseCase(
                name="Kriterien- und Lieferantengrobauswahl",
                description="• Systematische Erfassung und Bewertung quantitativer Kriterien (Kosten, Lieferzeiten, Kapazitäten, etc.) sowie qualitativer Kriterien (Nachhaltigkeitszertifikate, Qualitätsstandards, etc.) für eine multikriterielleLieferantenauswahl\n• Gewichtung der Kriterien mit projektspezifischen Anforderungen und Bedarfsanforderungen und Erstellung eines Lieferanten_x0002_Rankings mittels Algorithmus",
                useCase_id=use_cases[0].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Geocodiertes Mapping",
                description="• Vertiefende Bewertung der in der Grobauswahl identifizierten Lieferanten anhand detaillierter logistischer und vertraglicher Kriterien\n• Berücksichtigung logistischer Komplexität durch Geocodierung\n• Optimierung der Lieferkette anhand vorab definierter Kriterien",
                useCase_id=use_cases[0].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Steuerung & Modellierung",
                description="Automatisierter, modellbasierter Aufbau der Lieferkette durch Integration und Zusammenführung von Lieferketten-Stammdaten (inkl. Geodaten) und Informationen des aktuellen Zustands der Lieferkette aus IT-Systemen, dem Datenraum und Edge-Devices",
                useCase_id=use_cases[1].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Szenario-Bewertung",
                description="• Erstellung, Verwaltung und Analyse verschiedener Szenarien für die Lieferkette zur simulativen Bewertung von Auswirkungen durch Änderungen, Störungen oder Optimierungen via Szenario_x0002_Wizard • Nutzer können gezielt Parameter und Strukturen anpassen und Effekte auf Lieferkette, Termine, Kosten und Versorgungssicherheit vergleichen",
                useCase_id=use_cases[1].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Control-Tower",
                description="• Interaktive Dashboards mit integrierter Kartenvisualisierung zur anschaulichen Darstellung zentraler Supply Chain KPIs \n• Drill-Down-Funktionen ermöglichen gezielte Analyse von Kennzahlen für bestimmte Regionen, Knotenpunkte, Distributionskanäle oder einzelne Lieferungen \n• Multi-Projekt-Analysesystem zum Wechseln zwischen parallelen Projekten bzw. gemeinsamer KPI-Auswertung",
                useCase_id=use_cases[1].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Kollaborative Orchestrierung",
                description="• Kollaborative Nutzung des digitalen Zwillings für Supply Chain-Partner durch rollen_x0002_und berechtigungsbasierte Steuerung \n• Ermöglicht abgestimmte Planung, souveränen Datenaustausch und koordinierte Prozesssteuerung zwischen definierten Lieferkettenakteuren",
                useCase_id=use_cases[1].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="RM.Erkennung Automatisierte Risikoerkennung",
                description="• Automatisierte Identifikation (LLMs zur semantischen Interpretation) von Supply Chain-Risiken durch KI_x0002_gestützte Analyse öffentlicher Datenquellen und Newsfeeds (Wetterextreme, geopolitische Ereignisse, Lieferanteninsolvenz, Transportausfälle, etc.). \n• Priorisierte Risikoliste je Projekt/Lieferkette mit Wahrscheinlichkeit und betroffenen Entitäten für schnelle Frühwarnung",
                useCase_id=use_cases[2].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="RM.Impact Risiko-Impact-Analyse",
                description="• Auswirkungen erkannter Risiken lieferkettenspezifisch quantifizieren \n• Risikoszenarien aus Sub Use Case 2.03-1 abbilden → Simulation/What-if-Szenarien in Sub Use Case 2.02 einbinden → KPI-Impact berechnen und im Control Tower (Sub Use Case 2.02-3) ausgeben \n• Ergebnis: kaskadierende Effekte auf die Lieferkette, Engpässe, betroffene Entitäten, Verzögerungen, etc.",
                useCase_id=use_cases[2].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="RM.Handlungsempfehlungen",
                description="• KI-gestützte Generierung konkreter, priorisierter Handlungsempfehlungen zur Mitigierung identifizierter und bewerteter Risiken \n• Multikriterielle Bewertung alternativer Maßnahmen unter Berücksichtigung von Kosten, Umsetzungszeitrahmen, etc. \n• Identifikation alternativer Szenarien (z.B. Lieferantenwechsel, Routenänderungen) durch Nutzung des digitalen Zwillings und Simulationsmodells",
                useCase_id=use_cases[2].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Produktauswahl",
                description="Strukturierte Zusammenführung planungsspezifischer Anforderungen bildet die Grundlage für die Entwicklung eines digitalen Datenraums zur modellbasierten Produktauswahl. Produktspezifische Bauteile optimieren Planung im Modell. Die Rückführung dieser Information unterstützt die werk_x0002_und montagegerechte Umsetzung und ermöglicht die Erstellung eines As-built-Modells mit umfassender Material_x0002_dokumentation.",
                useCase_id=use_cases[3].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Koordinierte Fachplanung",
                description="Automatisierte Änderungsbenachrichtigung für Fachplaner (TGA, Tragwerksplanung) basierend auf Architekturmodelländerungen. Fachplaner definieren vorab relevante Bauteile und Toleranzen. Bei neuen Modellständen werden nur relevante Änderungen gemeldet, um die Koordination zu beschleunigen und die Informationsflut zu reduzieren.",
                useCase_id=use_cases[3].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Vergabe",
                description="Erstellung eines detaillierten Plans zur Bauausführung, der alle relevanten Schritte und Ressourcen umfasst. Übergabe der Informationen aus der Ausführungsplanung (Abhängigkeiten von Prozessen, Lieferzeiten von Produkten, Montagehinweise von Produkten) in die Phase der Bauausführung (über verschiedene Anwendungen).",
                useCase_id=use_cases[3].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Entscheidungsdokumentation",
                description="• Dokumentation und Nachvollziehbarkeit von Entscheidungen in der vernetzten Planung \n• Jede Entscheidung folgt einem einheitlichen Zyklus von der Vorlage bis zum Lernen \n• Dealbreaker wie Zeit, Kosten oder Genehmigung werden früh erkannt und geprüft \n• Das Entscheidungsnetz macht Prozesse transparent, versioniert und nachvollziehbar.",
                useCase_id=use_cases[3].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Preisabfrage für die Anmietung von Equipment",
                description="• Automatisierte, standardisierte Preisabfrage für Miet_x0002_Equipment • Digitale Schnittstellen zwischen Fachunternehmen und Baudienstleistern \n• Verbindliches Angebot inkl. Preis, CO₂-Bilanz und Verbrauchsdaten → Ziel: transparente und effiziente Angebotsprozesse im Datenraum",
                useCase_id=use_cases[4].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Baupreis Komplettleistung",
                description="Ziel ist es die Einholung, Auswertung und Konsolidierung von Angeboten für die komplette Bauleistung. Durch den Abgleich von Preis, Leistung und Termin werden Lücken und Doppelungen vermieden und eine verlässliche Vergabeentscheidung ermöglicht. Cloudbasierte Tools unterstützen Angebotsübermittlung, Versionskontrolle und Auswertung.",
                useCase_id=use_cases[4].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Planung Materialanlieferung",
                description="• Ablaufplanung einer Materiallieferung in die laufende Bauproduktion. \n• Der Sub UC ermöglicht die Koordination der Baulogistik zwischen Bauleitung, Unternehmen, Händler & Lieferanten sowie Spediteuren. \n• Er bietet eine Basis, um anhand von Lieferscheinen die Materialdaten von Herstellern zum eingebauten Material zu übergeben \n• Verkehrsoptimierung im Baustellenumfeld",
                useCase_id=use_cases[5].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Baufortschrittskontrolle über Punktwolkenscans",
                description="• Sammeln von Baufortschrittsinformationen über die Durchführung von zyklischen Punktwolkenscans\n• Abgleich der verarbeiteten Scandaten mit dem Soll-4D_x0002_BIM-Modell inkl. hinterlegter Aktivitäten\n• Bereitstellung eines Toolingszur Ermittlung des aktuellen Fertigstellungsgrads bezogen auf die ausgeführten Bauaktivitäten",
                useCase_id=use_cases[6].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Baufortschrittskontrolle über Dokumente und Meldungen",
                description="• Sammeln aller baufortschrittsrelevanten Informationen in Form von Dokumenten und Rückmeldungen aus Softwaretools \n• Auswertung der gesammelten Information in Bezug auf den aktuellen Bauablaufplan \n• Bereitstellung eines aktuellen Fertigstellungsgrads bezogen auf die ausgeführten Bauaktivitäten",
                useCase_id=use_cases[6].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Baufortschrittskontrolle über Bildaufnahmen",
                description="• Sammeln von Baufortschrittsinformationen über die Durchführung von zyklischen Bildaufnahmen \n• Verortung und Auswertung der Aufnahmen und Ermittlung von Mengen und mapping auf die entsprechende Aktivität \n• Bereitstellung eines aktuellen Fertigstellungsgrads bezogen auf die ausgeführten Bauaktivitäten",
                useCase_id=use_cases[6].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="KI-Frühwarnsystem",
                description="• Sammeln und auswerten von projektrelevanten Informationen \n• Auswertung der gesammelten und zur Verfügung gestellten Informationen in Bezug auf den aktuellen Bauablauf \n• Bereitstellung von Handlungsvorschlägen um auf entsprechende Abweichungen oder Störungen zu reagieren",
                useCase_id=use_cases[6].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="ESG-Base",
                description="• Anforderungen an die Nachhaltigkeitsberichterstatt_x0002_ung definieren und versenden \n• Von der Baustelle werden Nachhaltigkeitsdaten gesendet \n• Nachhaltigkeitsdaten werden zwischengespeichert \n• Datenanfrage von ESG_x0002_Reporting \n• Anreicherung & Berechnung in Tools außerhalb des Datenraums (verm. Out of Construct-X Scope)",
                useCase_id=use_cases[7].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="ESG-Planning",
                description="• Anforderungen an Nachhaltig_x0002_keitsberichterstattung definieren und versenden \n• Planung sendet die Bauwerksinformationen in einem Informationsmodell \n• Informationsmodell wird als Input für die Nachhaltigkeits_x0002_berechnung verwendet \n• Anreicherung & Berechnung in Tools außerhalb des Datenraums \n• Ergebnisse an die Beteiligten versenden",
                useCase_id=use_cases[7].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="ESG-As-Built",
                description="• Anforderungen an Nachhaltig_x0002_keitsberichterstattung abrufen \n• Objektplanung stellt nach der Abnahme die Bauwerksdokumentation in einem Informationsmodell zur Verfügung \n• Informationsmodell wird als Input für die Nachhaltigkeits_x0002_berechnung verwendet\n• Anreicherung & Berechnung in Tools außerhalb des Datenraums \n• Versand der Ergebnisse",
                useCase_id=use_cases[7].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="ESG-On-Site",
                description="• Erfassung der Nachhaltigkeits_x0002_daten während der Baustelle (Maschinendaten, MDP_x0002_Informationen und weitere Daten) \n• Sammlung und Zwischenspeicherung der Daten \n• Versand der Daten auf Anfrage des ESG-Reporting",
                useCase_id=use_cases[7].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Szenario Schüttgut am Beispiel von Asphalt",
                description="• MDP zur Dokumentation des Produktflusses vom Rohstoff bis zum Recycling für eine CO2-Bilanzierung, Schadstoffberechnung und Zirkularitätsbewertung \n• Erstellung eines Lebenszyklus begleitenden Materialdatenpasses für ein Schüttgut anhand des Beispiels von Asphalt",
                useCase_id=use_cases[8].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Szenario System am Beispiel eines Doppelbodens",
                description="• MDP zur Dokumentation des Produktflusses vom Rohstoff bis zur Vorbereitung zur Wiederverwendung für eine CO2-Bilanzierung, Schadstoffberechnung und Zirkularitätsbewertung \n• Erstellung eines Lebenszyklus begleitenden Materialdatenpasses für ein System anhand des Beispiels eines Doppelbodens",
                useCase_id=use_cases[8].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Szenario Produkt am Beispiel eines Luftdurchlasses",
                description="• MDP zur Dokumentation des Produktflusses vom Rohstoff bis zur Vorbereitung zur Wiederverwendung für eine CO2-Bilanzierung, Schadstoffberechnung und Zirkularitätsbewertung \n• Erstellung eines Lebenszyklus begleitenden Materialdatenpasses für ein Produkt anhand des Beispiels eines Luftdurchlasses",
                useCase_id=use_cases[8].id,
                roles=[roles[0]],
            ),
            models.SubUseCase(
                name="Automatisierter Materialtransport",
                description="• Automatisierung des Materialtransportes auf der Baustelle unter Bereitstellung der benötigten Daten in Echtzeit und Steuerung einer Missionsplanung. \n• Schaffung der Voraussetzung, dass neue Maschinen & Dienstleitungen entwickelt und gewinnorientiert am Markt platziert werden können\n• Schaffung der Grundlagen für die Automatisierung der Baustelle",
                useCase_id=use_cases[9].id,
                roles=[roles[0]],
            ),
        ]
        db.add_all(sub_use_cases)
        db.commit()
        print(f"  ✓ {len(sub_use_cases)} Sub Use Cases erstellt")

        # -------- Transactions --------
        transactions = [
            models.Transaction(
                name="Rechenwerte-Einbau",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="OEM (typische Verbrauchsdaten, Emissionen Einbaugeräte)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten(generische Daten für Angebotserstellung) (Masse, Weg, Transportmittel)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Rechenwerte -Transporte / Entfernung, Umrechnungsfaktoren",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Herstellungsort / CO2 Umrechnungsfaktoren Transporte",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Herstellungsort / CO2 Umrechnungsfaktoren Transporte",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="CO2-Umrechnungsfaktoren Energiemix, Transporte, Verbrauchsstoffe/ Bestandteile, Transport während Produktherstellung",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="EU-Regsiter-ID",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Ergebnisse zur Prüfung des Schadstoffgehalts im Rezyklatanteil",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="BIM-Modell (aus UC 2.4)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Aktuelles BIM-Modell inkl. Nachhaltigkeitszertifikate (z.B. Gebäudedokumentation / Materialliste + Produktinformationen + Demontierbarkeit + Zugänglichkeit)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR Update gemäß LCA B1-8",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung CO2-Bilanz",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung Schadstoffe",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung Zirkularität",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung transporthängige Emissionen",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung einbauhängige Emissionen",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsberechnung Gesamtemissionen (CO2-Bilanz, Zirkularität, Schadstoffgehalt)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Eventdaten zum Wareneingang",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Eventdaten zur Lagerung",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsdaten aus dem Transport auf der Baustelle",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR Update gemäß LCA-Phase A4",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Eventdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten zur Nachhaltigkeitsberechnung des Transports auf der Baustelle",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Ereignisdaten zum Wareneingang",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Ereignisdaten zur Lagerung",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsbezogene Maschinendaten",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Für Betrieb relevante Mehrwertdaten (Wartungs-, Reparatur-, Instandhaltungsinformationen, ...) ",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Abnahmedokumentation",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="As-built BIM-Modell inkl. Einbaudaten",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR Update gemäß LCA-Phase A5",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten für Nachhaltigkeitsberechnung CO2-Bilanz",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten für Nachhaltigkeitsberechnung  Zirkularität",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten für Nachhaltigkeitsberechnung Schadstoffgehalt",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten CO2-Bilanz",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten Schafstoffe",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten Zirkularität",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Regristrieungsdaten DPP-CPR",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR (inkl. aller folgenden Updates gem. LCA-Phasen)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten (z.B. Produkt-ID, Artikelbeschreibung, Hersteller, ...)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten zum Asphalt (z.B. Abmessung, Gewicht) ",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Eventdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten zur Nachhaltigkeitsberechnung des Transports auf der Baustelle",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Ereignisdaten zum Warenausgang",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Ereignisdaten zur Zwischenlagerung",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Maschinendaten",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten aus dem Transport (z.B. Abmessung, Gewicht,...)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Aktuelles BIM-Modell inkl. Rückbaudaten",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR Update gemäß LCA-Phase C1-2",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten CO2-Bilanz",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten Schadstoffe",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Herstellerdaten Zirkularität",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="DPP-CPR Update gemäß LCA-Phase C3",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Metadaten zur erfolgreichen Archivierung",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Rohstoffdaten /Transportdaten / Verpackungsdaten/Recyclingpotenziale /Schadstoffdaten/Zirkularitätsdaten",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Rohstoffdaten /Transportdaten / Verpackungsdaten/Recyclingpotenziale /Schadstoffdaten/Zirkularitätsdaten ",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Asphalt-Daten (z.B. Produkt-ID, Artikelbeschreibung, Hersteller, ...)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Nachhaltigkeitsdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Eventdaten aus dem Transport",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
            ),
            models.Transaction(
                name="Logistikdaten aus dem Transport (z.B. Abmessung, Gewicht)",
                subUseCase_id=sub_use_cases[24].id,
                roleOut_id=roles[0].id,
                roleIn_id=roles[1].id,
                usesDataspace=True,
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
                name="Construct-X",
                definition="Alle Merkmale, die im Projekt Construct-X entstehen.",
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
                name="Allgemeine Informationen",
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
                name="Asphalt",
                definition="Bauprodukt Asphalt",
                category=models.Category.CLASS,
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