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