import type {
    UseCase,
    SubUseCase,
    Role,
    Transaction,
    UseCaseCreate,
    SubUseCaseCreate,
    Property,
    PropertyGroup
} from "../types.ts";

export const BASE = import.meta.env.VITE_API_URL;

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, opts)
    //.then(res => res.json())
    //.then(data => console.log('Response:', data))  // ← Hier steht der Fehler
    //.catch(err => console.error('Error:', err));
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
}

export const api = {
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
    uploadSubUseCaseBPMN: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return request<SubUseCase>(`/subusecases/${id}/upload-bpmn`, {
            method: "POST",
            body: formData,
        });
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
    getTransaction: (id:number) => request<Transaction>(`/transactions/${id}`),
    createTransaction: (data: Partial<Transaction>) =>
        request<Transaction>("/transactions/", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json"},
        }),
    updateTransaction: (id: number, data: Partial<Transaction>) =>
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