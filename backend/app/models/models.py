import uuid
from sqlalchemy import Boolean, Column, Date, Integer, String, ForeignKey, Table, DateTime, func, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import UUID as PRUUID
import enum
from ..db import Base

# Many-to-Many Beziehung zwischen UseCase und Role
useCase_roles = Table(
    "useCase_roles",
    Base.metadata,
    Column("useCase_id", ForeignKey("useCases.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
)

class UseCase(Base):
    __tablename__ = "useCases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    keywords = Column(ARRAY(String))
    description = Column(String)
    relation_to_other_useCases = Column(String)
    uc_owner_institution = Column(String)
    uc_owner = Column(String)
    conx_id = Column(String)

    # Relationships
    subUseCases = relationship("SubUseCase", back_populates="useCase", cascade="all, delete-orphan")
    roles = relationship("Role", secondary=useCase_roles, back_populates="useCases")


class SubUseCase(Base):
    __tablename__ = "subUseCases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    short_name = Column(String, index=True)
    conx_id = Column(String, nullable=True)
    description = Column(String)
    useCase_id = Column(Integer, ForeignKey("useCases.id"))
    objective = Column(String, nullable=True)
    inputs = Column(String, nullable=True)
    outputs = Column(String, nullable=True)
    potential_risks = Column(String, nullable=True)
    distinction_from_other_sucs = Column(String, nullable=True)
    dependency_of_other_sucs = Column(String, nullable=True)
    assumptions = Column(String, nullable=True)

    bpmn_png_url = Column(String, nullable=True)
    bpmn_xml = Column(Text, nullable=True)

    # Relationships
    useCase = relationship("UseCase", back_populates="subUseCases")
    subUseCase_roles = relationship(
        "SubUseCaseRole",
        back_populates="subUseCase",
        cascade="all, delete-orphan",
    )
    transactions = relationship("Transaction", back_populates="subUseCase", cascade="all, delete-orphan")

class SubUseCaseRole(Base):
    __tablename__ = "subUseCase_roles"

    id = Column(Integer, primary_key=True, index=True)
    subUseCase_id = Column(Integer, ForeignKey("subUseCases.id", ondelete="CASCADE"))
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"))
    motivation = Column(String, nullable=True)
    goal = Column(String, nullable=True)
    monetary_benefit = Column(String, nullable=True)

    subUseCase = relationship("SubUseCase", back_populates="subUseCase_roles")
    role = relationship("Role")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    process_number = Column(String)
    name = Column(String)
    subUseCase_id = Column(Integer, ForeignKey("subUseCases.id"))
    roleOut_id = Column(Integer, ForeignKey("roles.id"))
    roleIn_id = Column(Integer, ForeignKey("roles.id"))
    usesDataspace = Column(Boolean)
    related_class_id = Column(String, nullable=True)
    data_carrier = Column(String, nullable=True)
    dataformat_available = Column(String, nullable=True)
    dataformat = Column(String, nullable=True)
    timing = Column(String, nullable=True)
    policies = Column(String, nullable=True)
    data_size = Column(String, nullable=True)

    # Relationships
    subUseCase = relationship("SubUseCase", back_populates="transactions")
    roleOut = relationship("Role", foreign_keys=[roleOut_id], back_populates="transactions_out")
    roleIn = relationship("Role", foreign_keys=[roleIn_id], back_populates="transactions_in")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    definition = Column(String)
    source = Column(Integer, ForeignKey("standards.id"))

    # Relationships
    useCases = relationship("UseCase", secondary=useCase_roles, back_populates="roles")
    subUseCase_roles = relationship("SubUseCaseRole", back_populates="role")
    standard = relationship("Standard", back_populates="roles")
    transactions_out = relationship("Transaction", foreign_keys="Transaction.roleOut_id", back_populates="roleOut")
    transactions_in = relationship("Transaction", foreign_keys="Transaction.roleIn_id", back_populates="roleIn")


class Property(Base):
    __tablename__ = "properties"
    UUID = Column(PRUUID(as_uuid=True), primary_key=True, default=uuid.uuid4, info={
        'code': 'PA001',
        'name': 'global eindeutiger Bezeichner',
        'beschreibung': 'global eindeutiger Bezeichner',
        'beispiel': '936DA01F-9ABD-4D9D-80C7-02AF85C822A8',
    })
    active = Column(Boolean, nullable=False, info={
        'code': 'PA002',
        'name': 'Status',
        'beschreibung': 'Status des Merkmals während seines Lebenszyklus',
        'beispiel': 'aktiv',
    })
    date_of_creation = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), info={
        'code': 'PA003',
        'name': 'Datum der Erstellung',
        'beschreibung': 'Datum der Validierung der Anfrage zur Erstellung des Merkmals durch Sachverständige',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_activation = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'PA004',
        'name': 'Datum der Aktivierung',
        'beschreibung': 'Datum, nach dem das Merkmal verwendet werden kann',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_change = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'PA005',
        'name': 'Datum der letzten Änderung',
        'beschreibung': 'Datum der Validierung der letzten Änderungsanfrage durch Sachverständige',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_revision = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'PA006',
        'name': 'Datum der Überarbeitung',
        'beschreibung': 'Datum der Überarbeitung',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_version = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'PA007',
        'name': 'Datum der Version',
        'beschreibung': 'Datum der Version',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_deactivation = Column(DateTime(timezone=True), nullable=True, info={
        'code': 'PA008',
        'name': 'Datum der Deaktivierung',
        'beschreibung': 'Datum, ab dem das Merkmal veraltet ist; das Merkmal wird im Datenkatalog behalten',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    version = Column(Integer, nullable=False, info={
        'code': 'PA009',
        'name': 'Versionsnummer',
        'beschreibung': 'Diese Versionsnummer ermöglicht die Verfolgung größerer Änderungen. Sachverständige entscheiden, ob eine neue Versionsnummer angewendet werden muss.',
        'beispiel': '2',
    })
    number_of_revision = Column(Integer, nullable=True, info={
        'code': 'PA010',
        'name': 'Nummer der Überarbeitung',
        'beschreibung': 'Diese Nummer der Überarbeitung ermöglicht die Verfolgung kleinerer Änderungen, z. B. neue Übersetzung, Korrekturen von Tippfehlern: wenn sich die Versionsnummer ändert, beginnt die Nummer der Überarbeitung wieder bei 1. Sachverständige entscheiden, ob eine neue Nummer der Überarbeitung angewendet werden kann oder ob eine neue Überarbeitung erforderlich ist.',
        'beispiel': '3',
    })
    list_of_replaced_properties = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'PA011',
        'name': 'Liste ersetzter Merkmale',
        'beschreibung': 'global eindeutiger Bezeichner (Attribut PA001) des ersetzten Merkmals (oder der Merkmale)',
        'beispiel': '(946DA01F-9ABD-4D9D-80C7-02AF-85C822A8,946DA01F-9ABD-4D9D-80C7-02AF85C822A9)',
    })
    list_of_replacing_properties = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'PA012',
        'name': 'Liste ersetzender Merkmale',
        'beschreibung': 'global eindeutiger Bezeichner (Attribut PA001) des ersetzenden Merkmals (oder der Merkmale)',
        'beispiel': '(946DA01F-9ABD-4D9D-80C7-02AF-85C822A8,946DA01F-9ABD-4D9D-80C7-02AF85C822A9)',
    })
    reason_for_rejection = Column(String, nullable=True, info={
        'code': 'PA013',
        'name': 'Erläuterung für die Ablehnung',
        'beschreibung': 'Satz, der den Grund für die Ablehnung erläutert, der erklären kann, wie Werte umzurechnen sind, damit sie dem neuen Merkmal entsprechen; diese Erläuterung muss in internationalem Englisch (EN) geschrieben werden',
        'beispiel': '',
    })
    relation_to_other_catalogues = Column(String, nullable=True, info={
        'code': 'PA014',
        'name': 'Beziehung der Merkmalsbezeichner in den miteinander verbundenen Datenkatalogen',
        'beschreibung': 'Liste von Paaren (interner Merkmalsbezeichner, entsprechender Datenkatalog-Bezeichner) dieses Attribut sollte für die Verträglichkeit zwischen bereits vorhandenen Merkmalen verwendet werden',
        'beispiel': '(internalGUID1, ), bsdd.buildingsmart.org),(internalGUID2, PPBIM)',
    })
    language_of_creator = Column(String, nullable=False, info={
        'code': 'PA015',
        'name': 'Sprache des Erstellers',
        'beschreibung': 'Sprache des Erstellers des Merkmals',
        'beispiel': 'en-EN, en-GB, IFC-IFC, EN (für internationales Englisch)',
    })
    name = Column(String, nullable=False, index=True, info={
        'code': 'PA016',
        'name': 'Namen in Sprache N',
        'beschreibung': 'Liste von Paaren (Name des Merkmals und Sprache) dieses Attribut kann verwendet werden, um Synonyme für verschiedene Domänen hinzuzufügen',
        'beispiel': '((PropertyName | en-EN),(Nompropriété | fr-FR),(IfcPropertyName | IFC))',
    })
    definition = Column(String, nullable=False, info={
        'code': 'PA017',
        'name': 'Definition in Sprache N',
        'beschreibung': 'Liste von Paaren (Definition des Merkmals, Sprache)',
        'beispiel': '',
    })
    description = Column(String, nullable=True, info={
        'code': 'PA018',
        'name': 'Beschreibungen in Sprache N',
        'beschreibung': 'Liste von Paaren (Beschreibung des Merkmals, Sprache) dieses Attribut wird verwendet, um eine Beschreibung des Merkmals als Klartext bereitzustellen',
        'beispiel': '',
    })
    examples = Column(String, nullable=True, info={
        'code': 'PA019',
        'name': 'Beispiele in Sprache N',
        'beschreibung': 'Liste von Paaren (Beispielwerte, Sprache) dieses Attribut kann zur Veranschaulichung der möglichen Werte des Merkmals verwendet',
        'beispiel': '',
    })
    related_properties = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'PA020',
        'name': 'Verbundene Merkmale',
        'beschreibung': 'Liste der global eindeutigen Bezeichner der verbundenen Merkmale (Attribut PA001); der Wert eines Merkmals steht zu den Werten der anderen in einer Beziehung. Beispielsweise ist ein Schallabsorptionsgrad für eine bestimmte Frequenz gegeben, in diesem Fall sind Schallabsorptionsgrad und Frequenz verbundene Merkmale.',
        'beispiel': '(945DA01F-9BBD-4D9D-80C7-02AF-85C822A8, 945DA01F-9BBD-4D9D-80C7-02AF85C822A7)',
    })
    groups = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={ # TODO muss eigentlich nullable=False
        'code': 'PA021',
        'name': 'Merkmalsgruppe(n) (Alternative Verwendung, Klasse, zusammengesetztes Merkmal, Domäne, Referenzdokument',
        'beschreibung': 'Liste von global eindeutigen Bezeichnern von Merkmalsgruppen (Attribut GA001), denen das Merkmal angehört',
        'beispiel': '(945DA01F-9BBD-4D9D-80C7-02AF-85C822A8, 945DA01F-9BBD-4D9D-80C7-02AF85C822A7)',
    })
    symbols = Column(ARRAY(String), nullable=True, info={
        'code': 'PA022',
        'name': 'Symbole des Merkmals in einer gegebenen Merkmalsgruppe',
        'beschreibung': 'Liste von Paaren (Symbol des Merkmals, global eindeutiger Bezeichner der Merkmalsgruppe (Attribut GA001))',
        'beispiel': '(λ, 936DA01F-9ABD-4B6D-80C7-03BF-85C822A8)',
    })
    picture_url = Column(String, nullable=True, info={
        'code': 'PA023',
        'name': 'bildliche Darstellung',
        'beschreibung': 'bildliche Darstellung des Merkmals durch Skizzen, Fotos, Videos oder sonstige Multimedia-Objekte',
        'beispiel': '',
    })
    used_in_countries = Column(ARRAY(String), nullable=True, info={
        'code': 'PA024',
        'name': 'Land der Verwendung',
        'beschreibung': 'Land (Gruppe von Ländern, Kontinent), in dem das Merkmal für den Markt, auf dem die Beteiligten arbeiten, relevant ist. Zum Beispiel: ISOLE (das Nutzungsprofil „ISOLE“ ist dafür bestimmt, die Angabe der Eignung von Wärmedämmprodukten in Bezug auf die Bedürfnisse von Nutzern zu vereinfachen, und wie in einer Reihe von kodifizierten Texten dargelegt) hat es ein Land der Verwendung: Europa',
        'beispiel': '(FR, US, NO)',
    })
    subdivision_of_usage = Column(ARRAY(String), nullable=True, info={
        'code': 'PA025',
        'name': 'Unterteilung von Verwendung',
        'beschreibung': 'dokumentierte geographische Region der Verwendung des Merkmals',
        'beispiel': '(US-MT)',
    })
    country_of_origin = Column(String, nullable=True, info={
        'code': 'PA026',
        'name': 'Ursprungsland',
        'beschreibung': 'Land, aus dem die Anforderung an dieses Merkmal stammt',
        'beispiel': 'FR',
    })
    physical_quantity = Column(ARRAY(String), nullable=True, info={
        'code': 'PA027',
        'name': 'physikalische Größe',
        'beschreibung': 'Liste von Paaren (physikalische Größe | Sprache) Physikalische Größen werden in Einheiten des Internationalen Einheitensystems (SI) angegeben nicht physikalische Größen wie z. B. Text werden mit dem Wert „ohne“ angegeben dies ist gleichbedeutend mit einem Maß in ISO 16739-1 und ISO 10303 nur eine physikalische Größe kann einem Merkmal zugeordnet werden. Dieses Attribut wird verwendet, um die Größe in Klartext mit allen benötigten Übersetzungen bereitzustellen.',
        'beispiel': '((Mass | en-EN), (Masse | fr-FR))',
    })
    dimension = Column(String, nullable=True, info={
        'code': 'PA028',
        'name': 'Dimension',
        'beschreibung': 'im Falle einer physikalischen Größe, Dimension nach ISO 80000 (alle Teile) dieses Attribut ermöglicht, dass die Dimension maschinenlesbar ist; da alle physikalischen Größen von 7 Basisgrößen abgeleitet sind, wird es durch Angabe der Basisdimensionen mit zugehöriger Potenz (als rationale Zahl) in der folgenden Reihenfolge und mit jeweils einem Leerzeichen dazwischen angegeben Beispiele für Dimensionen werden in Anhang C bereitgestellt',
        'beispiel': 'für Beschleunigung (L T^{−2}) ist der anzugebende Wert 10 −20000 für Kapazität (L^{−2} M^{−1} T^{4} I^{2}) ist der anzugebende Wert −2 −142000',
    })
    measurement_method = Column(String, nullable=True, info={
        'code': 'PA029',
        'name': 'Messverfahren',
        'beschreibung': 'Beurteilung von Bauprodukten, um ihre Tauglichkeit entsprechend den Anforderungen in harmonisierten technischen Spezifikationen sicherzustellen',
        'beispiel': 'Art des Probekörpers nach EN 771-2 Wärmedurchgangskoeffizient nach ISO 10077-1',
    })
    data_type = Column(String, nullable=True, info={
        'code': 'PA030',
        'name': 'Datentyp',
        'beschreibung': 'Format für die Angabe des Wertes des Merkmals dies kann aus einer Software-Perspektive als Speicherungsart verstanden werden im Falle eines dynamischen Merkmals ist der Wert dieses Attributs der Datentyp des Ergebnisses der Berechnung mit der Gleichung',
        'beispiel': '(numerisch, numerisch), reell, ganze Zahl, Feld (1..m) von ganzen Zahlen, Feld (1..2) von ganzen Zahlen, Feld (1..m , 1..n) von reellen Zahlen',
    })
    dynamic = Column(Boolean, nullable=False, default=False, info={
        'code': 'PA031',
        'name': 'dynamisches Merkmal',
        'beschreibung': 'wenn es sich um ein dynamisches Merkmal handelt, hängt der Wert von den im Attribut PA032 bereitgestellten Parametern ab',
        'beispiel': 'nein',
    })
    dynamic_parameter = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'PA032',
        'name': 'Parameter des dynamischen Merkmals',
        'beschreibung': 'Liste von GUIDs von Merkmalen, welche Parameter der Funktion für ein dynamisches Merkmal sind',
        'beispiel': '',
    })
    units = Column(ARRAY(String), nullable=True, info={
        'code': 'PA033',
        'name': 'Einheiten',
        'beschreibung': 'eine Einheit zur Darstellung einer Skala, die es ermöglicht, einen Wert zu messen es ist möglich, dieses Attribut zu verwenden, um zu erläutern, dass dem Merkmal keine Einheit zugeordnet ist, indem „einheitslos“ verwendet wird',
        'beispiel': '(m²) (mm , m) (kg) (einheitslos)',
    })
    name_of_defining_values = Column(ARRAY(String), nullable=True, info={
        'code': 'PA034',
        'name': 'Name der definierenden Werte',
        'beschreibung': 'im Falle eines Feldes liefert dieses Attribut die Namen der Spaltenköpfe, festgelegt als Liste von Paaren (Name, Sprache)',
        'beispiel': 'im Falle eines Feldes (3, 2) ((frequency|en-EN),(fréquence|fr-FR)) im Falle eines Feldes (3, 3) (((temperature|en-EN),(température|fr-FR)), ((air flow|en-EN),(flux d’air|fr-FR)))',
    })
    defining_values = Column(ARRAY(String), nullable=True, info={
        'code': 'PA035',
        'name': 'definierende Werte',
        'beschreibung': 'im Falle eines Feldes liefert dieses Attribut die definierenden Werte, sofern zutreffend, der Datentyp wird durch das Attribut PA030 angegeben',
        'beispiel': 'im Falle eines Feldes (3, 2)((25, 50, 75),(0,4, 0,5, 0,6))',
    })
    tolerance = Column(ARRAY(String), nullable=True, info={
        'code': 'PA036',
        'name': 'Toleranz',
        'beschreibung': 'für numerische Werte; der Gesamtbetrag, um den eine bestimmte Einheit schwanken darf; sie ist die Differenz zwischen dem Höchstwert und dem Mindestwert für die Einheit',
        'beispiel': '',
    })
    digital_format = Column(ARRAY(String), nullable=True, info={
        'code': 'PA037',
        'name': 'digitales Format',
        'beschreibung': 'Paar für den digitalen Texttyp (Präzision, Maßeinheit) Präzision ist die Anzahl signifikanter Stellen',
        'beispiel': '(1E-2, W/m²* K)',
    })
    textformat = Column(String, nullable=True, info={
        'code': 'PA038',
        'name': 'Textformat',
        'beschreibung': 'Paar für den Texttyp (Verschlüsselung, Anzahl der Zeichen) die Verschlüsselung wird nach „Name der Codierungsnorm“ von IANA, RFC 2978 festgelegt',
        'beispiel': '(UTF-8, 32)',
    })
    possible_values = Column(ARRAY(String), nullable=True, info={
        'code': 'PA039',
        'name': 'Liste möglicher Werte in Sprache N',
        'beschreibung': 'Liste von Paaren (möglicher Wert für das Merkmal und Sprache) Werte können String oder Zahlen sein',
        'beispiel': '((Yes | en-EN), (No| en-EN) (Not Applicable | en-EN))',
    })
    limit_values = Column(ARRAY(String), nullable=True, info={
        'code': 'PA040',
        'name': 'Grenzwerte',
        'beschreibung': 'Paar (Liste von Grenzwert-Intervallen möglicher Werte für das Merkmal, Einheit)',
        'beispiel': '({(−15,−10),(−5,15)}, °C)',
    })

# ------------Merkmalsgruppen---------------

class Category(enum.Enum):
    ALTERNATIVE_USAGE = "alternative_Verwendung"
    CLASS = "Klasse"
    COMPOSITE_PROPERTY = "zusammengesetztes_Merkmal"
    DOMAIN = "Domäne"
    REFERENCE_DOCUMENT = "Referenzdokument"

class PropertyGroup(Base):
    __tablename__ = "propertyGroups"
    UUID = Column(PRUUID(as_uuid=True), primary_key=True, default=uuid.uuid4, info={
        'code': 'GA001',
        'name': 'global eindeutiger Bezeichner',
        'beschreibung': 'global eindeutiger Bezeichner',
        'beispiel': '936DA01F-9ABD-4D9D-80C7-02AF85C822A8',
    })
    active = Column(Boolean, nullable=False, info={
        'code': 'GA002',
        'name': 'Status',
        'beschreibung': 'Status der Merkmalsgruppe während seines Lebenszyklus',
        'beispiel': 'aktiv',
    })
    date_of_creation = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), info={
        'code': 'GA003',
        'name': 'Datum der Erstellung',
        'beschreibung': 'Datum der Validierung der Anfrage zur Erstellung der Merkmalsgruppe durch Sachverständige',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_activation = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'GA004',
        'name': 'Datum der Aktivierung',
        'beschreibung': 'Datum, nach dem das Merkmal verwendet werden kann',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_change = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'GA005',
        'name': 'Datum der letzten Änderung',
        'beschreibung': 'Datum der Validierung der letzten Änderungsanfrage durch Sachverständige',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_revision = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'GA006',
        'name': 'Datum der Überarbeitung',
        'beschreibung': 'Datum der Überarbeitung',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_version = Column(DateTime(timezone=True), nullable=False, info={
        'code': 'GA007',
        'name': 'Datum der Version',
        'beschreibung': 'Datum der Version',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    date_of_deactivation = Column(DateTime(timezone=True), nullable=True, info={
        'code': 'GA008',
        'name': 'Datum der Deaktivierung',
        'beschreibung': 'Datum, ab dem das Merkmal veraltet ist; das Merkmal wird im Datenkatalog behalten',
        'beispiel': '2024-12-16 14:30:00+01:00',
    })
    version = Column(Integer, nullable=False, info={
        'code': 'GA009',
        'name': 'Versionsnummer',
        'beschreibung': 'Diese Versionsnummer ermöglicht die Verfolgung größerer Änderungen. Sachverständige entscheiden, ob eine neue Versionsnummer angewendet werden muss.',
        'beispiel': '2',
    })
    number_of_revision = Column(Integer, nullable=True, info={
        'code': 'GA010',
        'name': 'Nummer der Überarbeitung',
        'beschreibung': 'Diese Nummer der Überarbeitung ermöglicht die Verfolgung kleinerer Änderungen, z. B. neue Übersetzung, Korrekturen von Tippfehlern: wenn sich die Versionsnummer ändert, beginnt die Nummer der Überarbeitung wieder bei 1. Sachverständige entscheiden, ob eine neue Nummer der Überarbeitung angewendet werden kann oder ob eine neue Überarbeitung erforderlich ist.',
        'beispiel': '3',
    })
    list_of_replaced_property_groups = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'GA011',
        'name': 'Liste ersetzter Merkmalsgruppen',
        'beschreibung': 'Liste von globalen Bezeichnern für die ersetzten Merkmalsgruppen',
        'beispiel': '(946DA01F-9ABD-4D9D-80C7-02AF-85C822A8,946DA01F-9ABD-4D9D-80C7-02AF85C822A9)',
    })
    list_of_replacing_property_groups = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'GA012',
        'name': 'Liste ersetzender Merkmalsgruppen',
        'beschreibung': 'Liste von globalen Bezeichnern für die ersetzenden Merkmalsgruppen',
        'beispiel': '(946DA01F-9ABD-4D9D-80C7-02AF-85C822A8,946DA01F-9ABD-4D9D-80C7-02AF85C822A9)',
    })
    reason_for_rejection = Column(String, nullable=True, info={
        'code': 'GA013',
        'name': 'Erläuterung für die Ablehnung',
        'beschreibung': 'Satz, der den Grund für die Ablehnung erläutert, der erklären kann, wie Werte umzurechnen sind, damit sie der neuen Merkmalsgruppe entsprechen; diese Erläuterung muss in internationalem Englisch (EN) geschrieben werden',
        'beispiel': '',
    })
    relation_to_other_catalogues = Column(String, nullable=True, info={
        'code': 'GA014',
        'name': 'Beziehung der Merkmalsbezeichner in den miteinander verbundenen Datenkatalogen',
        'beschreibung': 'Liste von Paaren (interner Bezeichner der Merkmalsgruppe, entsprechender Datenkatalog-Bezeichner) dieses Attribut sollte für die Kompatibilität zwischen bereits vorhandenen Merkmalsgruppen verwendet werden',
        'beispiel': '(internalGUID1, ), bsdd.buildingsmart.org),(internalGUID2, PPBIM)',
    })
    language_of_creator = Column(String, nullable=False, info={
        'code': 'GA015',
        'name': 'Sprache des Erstellers',
        'beschreibung': 'Sprache des Erstellers der Merkmalsgruppe',
        'beispiel': 'en-EN, en-GB, IFC-IFC, EN (für internationales Englisch)',
    })
    name = Column(String, nullable=False, index=True, info={
        'code': 'GA016',
        'name': 'Namen in Sprache N',
        'beschreibung': 'Liste von Paaren (Name der Merkmalsgruppe und Sprache) dieses Attribut kann verwendet werden, um Synonyme für verschiedene Domänen hinzuzufügen',
        'beispiel': '((PropertyName | en-EN),(Nompropriété | fr-FR))',
    })
    definition = Column(String, nullable=False, info={
        'code': 'GA017',
        'name': 'Definition in Sprache N',
        'beschreibung': 'Liste von Paaren (Definition der Merkmalsgruppe, Sprache)',
        'beispiel': '',
    })
    picture_url = Column(String, nullable=True, info={
        'code': 'GA018',
        'name': 'bildliche Darstellung',
        'beschreibung': 'bildliche Darstellung der Merkmalsgruppe durch Skizzen, Fotos, Videos oder sonstige Multimedia-Objekte',
        'beispiel': '',
    })
    used_in_countries = Column(ARRAY(String), nullable=True, info={
        'code': 'GA019',
        'name': 'Land der Verwendung',
        'beschreibung': 'Land, in dem die Merkmalsgruppe verwendet wird',
        'beispiel': '(FR, US)',
    })
    subdivision_of_usage = Column(ARRAY(String), nullable=True, info={
        'code': 'GA020',
        'name': 'Unterteilung von Verwendung',
        'beschreibung': 'dokumentierte geographische Region, in der die Merkmalsgruppe verwendet wird',
        'beispiel': '(US-MT)',
    })
    country_of_origin = Column(String, nullable=True, info={
        'code': 'GA021',
        'name': 'Ursprungsland',
        'beschreibung': 'Land, in dem die Anforderung für diese Merkmalsgruppe festgelegt wurde',
        'beispiel': 'FR',
    })
    category = Column(Enum(Category), nullable=False, default=Category.CLASS, info={
        'code': 'GA022',
        'name': 'Kategorie der Merkmalsgruppe',
        'beschreibung': 'gibt die Kategorie der erstellten Merkmalsgruppe an',
        'beispiel': 'Liste von Kategorien der Merkmalsgruppe: alternative Verwendung, Klasse, zusammengesetztes Merkmal, Domäne, Referenzdokument',
    })
    groups = Column(ARRAY(PRUUID(as_uuid=True)), nullable=True, info={
        'code': 'GA023',
        'name': 'übergeordnete Merkmalsgruppen',
        'beschreibung': 'ermöglicht die Verknüpfung einer Untergruppe mit einer übergeordneten Gruppe über ihre global eindeutigen Bezeichner (Attribut GA001) jedes einer Gruppe zugehörige Merkmal wird von der/den Untergruppe(n) übernommen',
        'beispiel': '(945DA01F-9BBD-4D9D-80C7-02AF-85C822A8, 945DA01F-9BBD-4D9D-80C7-02AF85C822A7)',
    })

# -----------Standards----------
class Standard(Base):
    __tablename__ = "standards"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, index=True)
    title = Column(String)
    subTitle = Column(String)
    date = Column(Date)
    link = Column(String)
    keywords = Column(ARRAY(String))
    description = Column(String)

    # Relationships
    roles = relationship("Role", back_populates="standard")