import { TypeRef } from "../types/types";

export type ContractStruct = {
    name: string;
    header: number;
    fields: ContractField[];
    allocation: Allocation;
}

export type Allocation = {
    prefix: number | null;
    root: AllocationCell;
}

export type AllocationCell = {
    fields: AllocationField[];
    next: AllocationCell | null;
    size: { bits: number, refs: number };
}

export type AllocationField = { index: number, size: { bits: number, refs: number } } & (
    | { kind: 'int' | 'uint', bits: number }
    | { kind: 'coins' }
    | { kind: 'address' }
    | { kind: 'struct', type: string }
    | { kind: 'slice' | 'cell' }
    | { kind: 'optional', inner: AllocationField }
    | { kind: 'remaining' }
    | { kind: 'bytes', bytes: number }
    | { kind: 'map' }
)

export type ContractField = {
    name: string;
    type: TypeRef;
}

export type ContractFunctionArg = {
    name: string;
    type: TypeRef
}

export type ContractInit = {
    name: string;
    args: ContractFunctionArg[];
}

export type CotnractFunction = {
    name: string;
    args: ContractFunctionArg[];
    returns: TypeRef | null;
}

export type ContractReceiver = {
    kind: 'internal-binary',
    type: string
} | {
    kind: 'internal-empty'
} | {
    kind: 'internal-comment',
    comment: string
} | {
    kind: 'internal-fallback'
}

export type ContractABI = {
    version: '0.0.1';
    name: string;
    structs: ContractStruct[];
    init: ContractInit | null;
    receivers: ContractReceiver[];
    getters: CotnractFunction[];
    errors: {
        [id: string]: { message: string }
    },
    dependsOn: {
        [name: string]: { uid: number }
    }
}

export type Address = {
    wc: number;
    hash: number;
}