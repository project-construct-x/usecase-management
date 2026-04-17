export type RoleEnum = "read" | "write";

export interface User {
    id: number;
    email: string;
    username: string;
    role: RoleEnum;
    is_active: boolean;
    created_at: string;
}

export interface UserCreate {
    email: string;
    username: string;
    password: string;
    role?: RoleEnum;
}

export interface UserUpdate {
    email?: string;
    username?: string;
    role?: RoleEnum;
    is_active?: boolean;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface APIKey {
    id: number;
    key: string;
    name: string;
    role: RoleEnum;
    is_active: boolean;
    created_at: string;
    expires_at?: string;
}

export interface APIKeyCreate {
    name: string;
    role?: RoleEnum;
    expires_at?: string;
}

export interface Role {
    id: number;
    name: string;
    definition: string;
}

export interface SubUseCaseRole {
    role_id: number;
    motivation?: string;
    goal?: string;
    monetary_benefit?: string;
}

export interface SubUseCaseRoleRead extends SubUseCaseRole {
    role: Role;
}

export interface SubUseCase {
    id: number;
    name: string;
    useCase_id: number;
    description: string;
    objective: string;
    inputs: string;
    outputs: string;
    potential_risks: string;
    distinction_from_other_sucs: string;
    dependency_of_other_sucs: string;
    assumptions: string;
    subUseCase_roles: SubUseCaseRoleRead[];
    bpmn_png_url?: string;
    bpmn_xml?: string;
}

export interface SubUseCaseCreate {
    name: string;
    description: string;
    useCase_id: number;
    objective: string;
    inputs: string;
    outputs: string;
    potential_risks: string;
    distinction_from_other_sucs: string;
    dependency_of_other_sucs: string;
    assumptions: string;
    subUseCase_roles: SubUseCaseRole[];
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

export interface TransactionBase {
    id?: number;
    name: string;
    subUseCase_id: number | null;
    usesDataspace: boolean;
    process_number: string;
    related_class_id: string;
    data_carrier: string;
    dataformat_available: string;
    dataformat: string;
    timing: string;
    policies: string;
    data_size: string
}

export interface Transaction extends TransactionBase {
    id: number;
    roleOut: Role;
    roleIn: Role;
    subUseCase_name?: string;
}

export interface TransactionMutate extends TransactionBase {
    roleOut_id: number;
    roleIn_id: number;
}

export interface Property {
    UUID: string;
    active: boolean;
    date_of_creation?: string | null;
    date_of_activation?: string | null;
    date_of_change?: string | null;
    date_of_revision?: string | null;
    date_of_version?: string | null;
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
    groups: string[] | null;
    symbols?: string[] | null;
    picture_url?: string | null;
    used_in_countries?: string[] | null;
    subdivision_of_usage?: string[] | null;
    country_of_origin?: string | null;
    physical_quantity?: string[] | null;
    dimension?: string | null;
    measurement_method?: string | null;
    data_type?: string | null;
    dynamic: boolean;
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

export const Category = {
    ALTERNATIVE_USAGE: "alternative_Verwendung",
    CLASS: "Klasse",
    COMPOSITE_PROPERTY: "zusammengesetztes_Merkmal",
    DOMAIN: "Domäne",
    REFERENCE_DOCUMENT: "Referenzdokument"
} as const;

export type Category = typeof Category[keyof typeof Category];

export interface PropertyGroup {
    UUID: string;
    active: boolean;
    date_of_creation?: string | null;
    date_of_activation?: string | null;
    date_of_change?: string | null;
    date_of_revision?: string | null;
    date_of_version?: string | null;
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