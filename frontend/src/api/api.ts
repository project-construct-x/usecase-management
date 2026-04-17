import type {
    UseCase,
    SubUseCase,
    Role,
    Transaction,
    TransactionMutate,
    UseCaseCreate,
    SubUseCaseCreate,
    Property,
    PropertyGroup,
    User,
    UserCreate,
    UserUpdate,
    APIKey,
    APIKeyCreate,
    Token
} from "../types.ts";

export const BASE = import.meta.env.VITE_API_URL;

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    // Token oder API-Key aus localStorage holen
    const token = localStorage.getItem('access_token');
    const apiKey = localStorage.getItem('api_key');

    // Headers mit Authorization erweitern
    const headers = new Headers(opts.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    } else if (apiKey) {
        headers.set('X-API-Key', apiKey);
    }

    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }
    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
}

export const api = {
    // ---Auth---
    login: (username: string, password: string) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        return request<Token>("/token", {
            method: "POST",
            body: formData,
        });
    },

    register: (data: UserCreate) =>
        request<User>("/register", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"}
        }),

    getCurrentUser: () => request<User>("/users/me"),

    // ---Users---
    listUsers: () => request<User[]>("/users/"),

    updateUser: (id: number, data: UserUpdate) =>
        request<User>(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        }),

    deleteUser: (id: number) =>
        request<void>(`/users/${id}`, { method: "DELETE" }),

    // ---API Keys---
    listAPIKeys: () => request<APIKey[]>("/api-keys"),

    createAPIKey: (data: APIKeyCreate) =>
        request<APIKey>("api-keys", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),

    deleteAPIKey: (id: number) =>
        request<void>(`/api-keys/${id}`, { method: "DELETE" }),

    // ---UseCases---
    listUseCases: () => request<UseCase[]>("/usecases/"),
    getUseCase: (id:number) => request<UseCase>(`/usecases/${id}`),
    createUseCase: (data: UseCaseCreate) =>
        request<UseCase>("/usecases/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateUseCase: (id: number, data: Partial<UseCaseCreate>) =>
        request<UseCase>(`/usecases/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deleteUseCase: (id: number) =>
        request<void>(`/usecases/${id}`, {method: "DELETE"}),

    // ---SubUseCases---
    listSubUseCases: () => request<SubUseCase[]>("/subusecases/"),
    listSubUseCasesByRole: (roleId: number) =>
        request<SubUseCase[]>(`/subusecases/by-role/${roleId}`),
    getSubUseCase: (id:number) => request<SubUseCase>(`/subusecases/${id}`),
    createSubUseCase: (data: Partial<SubUseCaseCreate>) =>
        request<SubUseCase>("/subusecases/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateSubUseCase: (id: number, data: Partial<SubUseCaseCreate>) =>
        request<SubUseCase>(`/subusecases/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deleteSubUseCase: (id: number) =>
        request<void>(`/subusecases/${id}`, {method: "DELETE"}),
    updateSubUseCaseBPMNXML: (id: number, bpmn_xml: string) => {
        request<SubUseCase>(`/subusecases/${id}/bpmn-xml`, {
            method: "PUT",
            body: JSON.stringify({ bpmn_xml }),
            headers: { "Content-Type": "application/json" },
        })
    },

    // ---Roles---
    listRoles: () => request<Role[]>("/roles/"),
    getRole: (id:number) => request<Role>(`/roles/${id}`),
    createRole: (data: Partial<Role>) =>
        request<Role>("/roles/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateRole: (id: number, data: Partial<Role>) =>
        request<Role>(`/roles/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deleteRole: (id: number) =>
        request<void>(`/roles/${id}`, {method: "DELETE"}),

    // ---Transactions---
    listTransactions: () => request<Transaction[]>("/transactions/"),
    listTransactionsBySubUseCase: (subId: number) =>
      request<Transaction[]>(`/transactions/by-subusecase/${subId}`),
    getTransaction: (id:number) => request<Transaction>(`/transactions/${id}`),
    createTransaction: (data: TransactionMutate) =>
        request<Transaction>("/transactions/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateTransaction: (id: number, data: TransactionMutate) =>
        request<Transaction>(`/transactions/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deleteTransaction: (id: number) =>
        request<void>(`/transactions/${id}`, {method: "DELETE"}),

    // ---Properties---
    listProperties: () => request<Property[]>("/properties/"),
    getPropertiesByGroup: (group_uuid: string) => request<Property[]>(`/properties/by-group/${group_uuid}`),
    getProperty: (uuid: string) => request<Property>(`/properties/${uuid}`),
    createProperty: (data: Partial<Property>) =>
        request<Property>(`/properties/`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateProperty: (uuid: string, data: Partial<Property>) =>
        request<Property>(`/properties/${uuid}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deleteProperty: (uuid: string) =>
        request<void>(`/properties/${uuid}`, {method: "DELETE"}),

    // ---Property Groups---
    listPropertyGroups: () => request<PropertyGroup[]>("/propertygroups/"),
    listPropertyGroupsByCategory: (category: string) => request<PropertyGroup[]>(`/propertygroups/category/${category}`),
    getPropertyGroup: (uuid: string) => request<PropertyGroup>(`/propertygroups/${uuid}`),
    createPropertyGroup: (data: Partial<PropertyGroup>) =>
        request<PropertyGroup>(`/propertygroups/`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updatePropertyGroup: (uuid: string, data: Partial<PropertyGroup>) =>
        request<PropertyGroup>(`/propertygroups/${uuid}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    deletePropertyGroup: (uuid: string) =>
        request<void>(`/propertygroups/${uuid}`, {method: "DELETE"}),
}