export interface Role {
    id: number;
    name: string;
    definition: string;
}

export interface SubUseCase {
    id: number;
    name: string;
    useCase_id: number;
    description: string;
    roles: Role[];
    bpmn_png_url?: string;
}

export interface SubUseCaseCreate {
    name: string;
    description: string;
    roles: number[];
}

export interface UseCase {
    id: number;
    name: string;
    keywords: string[];
    roles: Role[];
    subUseCases: SubUseCase[];
}

export interface UseCaseCreate {
    name: string;
    keywords?: string[];
    roles: number[];
}

export interface Transaction {
    id: number;
    name: string;
    subUseCase_id: number;
    usesDataspace: boolean;
    roleIn_id: number;
    roleOut_id: number;
}

export interface Property {
    UUID: string;
    active: boolean;
    date_of_creation: string;
    date_of_activation: string;
    date_of_change: string;
    date_of_revision: string;
    date_of_version: string;
    date_of_deactivation?: string | null;
    version: number;
    number_of_revision?: number | null;
    list_of_replaced_properties?: string[] | null;
    list_of_replacing_properties?: string[] | null;
    reason_for_rejection?: string | null;
    relation_to_other_catalogues?: string | null;
    language_of_creator: string;
    name: string;
    definition: string;
    description?: string | null;
    examples?: string | null;
    related_properties?: string[] | null;
    groups: string[];
    symbols?: string[] | null;
    picture_url?: string | null;
    used_in_countries?: string[] | null;
    subdivision_of_usage?: string[] | null;
    country_of_origin?: string | null;
    physical_quantity?: string[] | null;
    dimension?: string | null;
    measurement_method?: string | null;
    data_type?: string | null;
    dynamic?: string | null;
    dynamic_parameter?: string[] | null;
    units?: string[] | null;
    name_of_defining_values?: string[] | null;
    defining_values?: string[] | null;
    tolerance?: string[] | null;
    digital_format?: string[] | null;
    textformat?: string | null;
    possible_values?: string[] | null;
    limit_values?: string[] | null;
}

export type Category =
    | "alternative_Verwendung"
    | "Klasse"
    | "zusammengesetztes_Merkmal"
    | "Domäne"
    | "Referenzdokument";

export interface PropertyGroup {
    UUID: string;
    active: boolean;
    date_of_creation: string;
    date_of_activation: string;
    date_of_change: string;
    date_of_revision: string;
    date_of_version: string;
    date_of_deactivation?: string | null;
    version: number;
    number_of_revision?: number | null;
    list_of_replaced_property_groups?: string[] | null;
    list_of_replacing_property_groups?: string[] | null;
    reason_for_rejection?: string | null;
    relation_to_other_catalogues?: string | null;
    language_of_creator: string;
    name: string;
    definition: string;
    picture_url?: string | null;
    used_in_countries?: string[] | null;
    subdivision_of_usage?: string[] | null;
    country_of_origin?: string | null;
    category: Category;
    groups?: string[] | null;
}