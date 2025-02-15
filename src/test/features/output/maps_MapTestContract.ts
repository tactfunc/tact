import { Cell, Slice, StackItem, Address, Builder, InternalMessage, CommonMessageInfo, CellMessage, beginCell, serializeDict, TupleSlice4 } from 'ton';
import { ContractExecutor, createExecutorFromCode, ExecuteError } from 'ton-nodejs';
import BN from 'bn.js';

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: BN;
    mode: BN;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function packSendParameters(src: SendParameters): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeBit(src.bounce);
    b_0 = b_0.storeAddress(src.to);
    b_0 = b_0.storeInt(src.value, 257);
    b_0 = b_0.storeInt(src.mode, 257);
    if (src.body !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.body);
    } else {
        b_0 = b_0.storeBit(false);
    }
    if (src.code !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.code);
    } else {
        b_0 = b_0.storeBit(false);
    }
    if (src.data !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.data);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSendParameters(src: SendParameters, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.bounce ? new BN(-1) : new BN(0) });
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.to).endCell() });
    __stack.push({ type: 'int', value: src.value });
    __stack.push({ type: 'int', value: src.mode });
    if (src.body !== null) {
        __stack.push({ type: 'cell', cell: src.body });
    } else {
        __stack.push({ type: 'null' });
    }
    if (src.code !== null) {
        __stack.push({ type: 'cell', cell: src.code });
    } else {
        __stack.push({ type: 'null' });
    }
    if (src.data !== null) {
        __stack.push({ type: 'cell', cell: src.data });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSendParameters(src: SendParameters): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.bounce ? new BN(-1) : new BN(0) });
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.to).endCell() });
    __stack.push({ type: 'int', value: src.value });
    __stack.push({ type: 'int', value: src.mode });
    if (src.body !== null) {
        __stack.push({ type: 'cell', cell: src.body });
    } else {
        __stack.push({ type: 'null' });
    }
    if (src.code !== null) {
        __stack.push({ type: 'cell', cell: src.code });
    } else {
        __stack.push({ type: 'null' });
    }
    if (src.data !== null) {
        __stack.push({ type: 'cell', cell: src.data });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSendParameters(slice: TupleSlice4): SendParameters {
    const bounce = slice.readBoolean();
    const to = slice.readAddress();
    const value = slice.readBigNumber();
    const mode = slice.readBigNumber();
    const body = slice.readCellOpt();
    const code = slice.readCellOpt();
    const data = slice.readCellOpt();
    return { $$type: 'SendParameters', bounce: bounce, to: to, value: value, mode: mode, body: body, code: code, data: data };
}
export function unpackTupleSendParameters(slice: TupleSlice4): SendParameters {
    const bounce = slice.readBoolean();
    const to = slice.readAddress();
    const value = slice.readBigNumber();
    const mode = slice.readBigNumber();
    const body = slice.readCellOpt();
    const code = slice.readCellOpt();
    const data = slice.readCellOpt();
    return { $$type: 'SendParameters', bounce: bounce, to: to, value: value, mode: mode, body: body, code: code, data: data };
}
export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: BN;
}

export function packContext(src: Context): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeBit(src.bounced);
    b_0 = b_0.storeAddress(src.sender);
    b_0 = b_0.storeInt(src.value, 257);
    return b_0.endCell();
}

export function packStackContext(src: Context, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.bounced ? new BN(-1) : new BN(0) });
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.sender).endCell() });
    __stack.push({ type: 'int', value: src.value });
}

export function packTupleContext(src: Context): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.bounced ? new BN(-1) : new BN(0) });
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.sender).endCell() });
    __stack.push({ type: 'int', value: src.value });
    return __stack;
}

export function unpackStackContext(slice: TupleSlice4): Context {
    const bounced = slice.readBoolean();
    const sender = slice.readAddress();
    const value = slice.readBigNumber();
    return { $$type: 'Context', bounced: bounced, sender: sender, value: value };
}
export function unpackTupleContext(slice: TupleSlice4): Context {
    const bounced = slice.readBoolean();
    const sender = slice.readAddress();
    const value = slice.readBigNumber();
    return { $$type: 'Context', bounced: bounced, sender: sender, value: value };
}
export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function packStateInit(src: StateInit): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeRef(src.code);
    b_0 = b_0.storeRef(src.data);
    return b_0.endCell();
}

export function packStackStateInit(src: StateInit, __stack: StackItem[]) {
    __stack.push({ type: 'cell', cell: src.code });
    __stack.push({ type: 'cell', cell: src.data });
}

export function packTupleStateInit(src: StateInit): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'cell', cell: src.code });
    __stack.push({ type: 'cell', cell: src.data });
    return __stack;
}

export function unpackStackStateInit(slice: TupleSlice4): StateInit {
    const code = slice.readCell();
    const data = slice.readCell();
    return { $$type: 'StateInit', code: code, data: data };
}
export function unpackTupleStateInit(slice: TupleSlice4): StateInit {
    const code = slice.readCell();
    const data = slice.readCell();
    return { $$type: 'StateInit', code: code, data: data };
}
export type SetIntMap1 = {
    $$type: 'SetIntMap1';
    key: BN;
    value: BN | null;
}

export function packSetIntMap1(src: SetIntMap1): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(1056067080, 32);
    b_0 = b_0.storeInt(src.key, 257);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeInt(src.value, 257);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetIntMap1(src: SetIntMap1, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetIntMap1(src: SetIntMap1): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetIntMap1(slice: TupleSlice4): SetIntMap1 {
    const key = slice.readBigNumber();
    const value = slice.readBigNumberOpt();
    return { $$type: 'SetIntMap1', key: key, value: value };
}
export function unpackTupleSetIntMap1(slice: TupleSlice4): SetIntMap1 {
    const key = slice.readBigNumber();
    const value = slice.readBigNumberOpt();
    return { $$type: 'SetIntMap1', key: key, value: value };
}
export type SetIntMap2 = {
    $$type: 'SetIntMap2';
    key: BN;
    value: boolean | null;
}

export function packSetIntMap2(src: SetIntMap2): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(2818252722, 32);
    b_0 = b_0.storeInt(src.key, 257);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeBit(src.value);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetIntMap2(src: SetIntMap2, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value ? new BN(-1) : new BN(0) });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetIntMap2(src: SetIntMap2): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value ? new BN(-1) : new BN(0) });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetIntMap2(slice: TupleSlice4): SetIntMap2 {
    const key = slice.readBigNumber();
    const value = slice.readBooleanOpt();
    return { $$type: 'SetIntMap2', key: key, value: value };
}
export function unpackTupleSetIntMap2(slice: TupleSlice4): SetIntMap2 {
    const key = slice.readBigNumber();
    const value = slice.readBooleanOpt();
    return { $$type: 'SetIntMap2', key: key, value: value };
}
export type SetIntMap3 = {
    $$type: 'SetIntMap3';
    key: BN;
    value: Cell | null;
}

export function packSetIntMap3(src: SetIntMap3): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(3506188068, 32);
    b_0 = b_0.storeInt(src.key, 257);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.value);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetIntMap3(src: SetIntMap3, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'cell', cell: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetIntMap3(src: SetIntMap3): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'cell', cell: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetIntMap3(slice: TupleSlice4): SetIntMap3 {
    const key = slice.readBigNumber();
    const value = slice.readCellOpt();
    return { $$type: 'SetIntMap3', key: key, value: value };
}
export function unpackTupleSetIntMap3(slice: TupleSlice4): SetIntMap3 {
    const key = slice.readBigNumber();
    const value = slice.readCellOpt();
    return { $$type: 'SetIntMap3', key: key, value: value };
}
export type SetIntMap4 = {
    $$type: 'SetIntMap4';
    key: BN;
    value: SomeStruct | null;
}

export function packSetIntMap4(src: SetIntMap4): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(1318632071, 32);
    b_0 = b_0.storeInt(src.key, 257);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeCellCopy(packSomeStruct(src.value));
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetIntMap4(src: SetIntMap4, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'tuple', items: packTupleSomeStruct(src.value) });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetIntMap4(src: SetIntMap4): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.key });
    if (src.value !== null) {
        __stack.push({ type: 'tuple', items: packTupleSomeStruct(src.value) });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetIntMap4(slice: TupleSlice4): SetIntMap4 {
    const key = slice.readBigNumber();
    const value_p = slice.pop();
    const value = value_p.type !== 'tuple' ? null : unpackTupleSomeStruct(new TupleSlice4(value_p.items));
    return { $$type: 'SetIntMap4', key: key, value: value };
}
export function unpackTupleSetIntMap4(slice: TupleSlice4): SetIntMap4 {
    const key = slice.readBigNumber();
    const value_p = slice.pop();
    const value = value_p.type !== 'tuple' ? null : unpackTupleSomeStruct(new TupleSlice4(value_p.items));
    return { $$type: 'SetIntMap4', key: key, value: value };
}
export type SetAddrMap1 = {
    $$type: 'SetAddrMap1';
    key: Address;
    value: BN | null;
}

export function packSetAddrMap1(src: SetAddrMap1): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(3295239033, 32);
    b_0 = b_0.storeAddress(src.key);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeInt(src.value, 257);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetAddrMap1(src: SetAddrMap1, __stack: StackItem[]) {
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetAddrMap1(src: SetAddrMap1): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetAddrMap1(slice: TupleSlice4): SetAddrMap1 {
    const key = slice.readAddress();
    const value = slice.readBigNumberOpt();
    return { $$type: 'SetAddrMap1', key: key, value: value };
}
export function unpackTupleSetAddrMap1(slice: TupleSlice4): SetAddrMap1 {
    const key = slice.readAddress();
    const value = slice.readBigNumberOpt();
    return { $$type: 'SetAddrMap1', key: key, value: value };
}
export type SetAddrMap2 = {
    $$type: 'SetAddrMap2';
    key: Address;
    value: boolean | null;
}

export function packSetAddrMap2(src: SetAddrMap2): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(1566575299, 32);
    b_0 = b_0.storeAddress(src.key);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeBit(src.value);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetAddrMap2(src: SetAddrMap2, __stack: StackItem[]) {
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value ? new BN(-1) : new BN(0) });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetAddrMap2(src: SetAddrMap2): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'int', value: src.value ? new BN(-1) : new BN(0) });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetAddrMap2(slice: TupleSlice4): SetAddrMap2 {
    const key = slice.readAddress();
    const value = slice.readBooleanOpt();
    return { $$type: 'SetAddrMap2', key: key, value: value };
}
export function unpackTupleSetAddrMap2(slice: TupleSlice4): SetAddrMap2 {
    const key = slice.readAddress();
    const value = slice.readBooleanOpt();
    return { $$type: 'SetAddrMap2', key: key, value: value };
}
export type SetAddrMap3 = {
    $$type: 'SetAddrMap3';
    key: Address;
    value: Cell | null;
}

export function packSetAddrMap3(src: SetAddrMap3): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(711408213, 32);
    b_0 = b_0.storeAddress(src.key);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.value);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetAddrMap3(src: SetAddrMap3, __stack: StackItem[]) {
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'cell', cell: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetAddrMap3(src: SetAddrMap3): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'cell', cell: src.value });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetAddrMap3(slice: TupleSlice4): SetAddrMap3 {
    const key = slice.readAddress();
    const value = slice.readCellOpt();
    return { $$type: 'SetAddrMap3', key: key, value: value };
}
export function unpackTupleSetAddrMap3(slice: TupleSlice4): SetAddrMap3 {
    const key = slice.readAddress();
    const value = slice.readCellOpt();
    return { $$type: 'SetAddrMap3', key: key, value: value };
}
export type SetAddrMap4 = {
    $$type: 'SetAddrMap4';
    key: Address;
    value: SomeStruct | null;
}

export function packSetAddrMap4(src: SetAddrMap4): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(3020140534, 32);
    b_0 = b_0.storeAddress(src.key);
    if (src.value !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeCellCopy(packSomeStruct(src.value));
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export function packStackSetAddrMap4(src: SetAddrMap4, __stack: StackItem[]) {
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'tuple', items: packTupleSomeStruct(src.value) });
    } else {
        __stack.push({ type: 'null' });
    }
}

export function packTupleSetAddrMap4(src: SetAddrMap4): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'slice', cell: beginCell().storeAddress(src.key).endCell() });
    if (src.value !== null) {
        __stack.push({ type: 'tuple', items: packTupleSomeStruct(src.value) });
    } else {
        __stack.push({ type: 'null' });
    }
    return __stack;
}

export function unpackStackSetAddrMap4(slice: TupleSlice4): SetAddrMap4 {
    const key = slice.readAddress();
    const value_p = slice.pop();
    const value = value_p.type !== 'tuple' ? null : unpackTupleSomeStruct(new TupleSlice4(value_p.items));
    return { $$type: 'SetAddrMap4', key: key, value: value };
}
export function unpackTupleSetAddrMap4(slice: TupleSlice4): SetAddrMap4 {
    const key = slice.readAddress();
    const value_p = slice.pop();
    const value = value_p.type !== 'tuple' ? null : unpackTupleSomeStruct(new TupleSlice4(value_p.items));
    return { $$type: 'SetAddrMap4', key: key, value: value };
}
export type SomeStruct = {
    $$type: 'SomeStruct';
    value: BN;
}

export function packSomeStruct(src: SomeStruct): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeInt(src.value, 257);
    return b_0.endCell();
}

export function packStackSomeStruct(src: SomeStruct, __stack: StackItem[]) {
    __stack.push({ type: 'int', value: src.value });
}

export function packTupleSomeStruct(src: SomeStruct): StackItem[] {
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: src.value });
    return __stack;
}

export function unpackStackSomeStruct(slice: TupleSlice4): SomeStruct {
    const value = slice.readBigNumber();
    return { $$type: 'SomeStruct', value: value };
}
export function unpackTupleSomeStruct(slice: TupleSlice4): SomeStruct {
    const value = slice.readBigNumber();
    return { $$type: 'SomeStruct', value: value };
}
export async function MapTestContract_init() {
    const __code = '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';
    const depends = new Map<string, Cell>();
    let systemCell = beginCell().storeDict(null).endCell();
    let __stack: StackItem[] = [];
    __stack.push({ type: 'cell', cell: systemCell });
    let codeCell = Cell.fromBoc(Buffer.from(__code, 'base64'))[0];
    let executor = await createExecutorFromCode({ code: codeCell, data: new Cell() });
    let res = await executor.get('init_MapTestContract', __stack, { debug: true });
    if (res.debugLogs.length > 0) { console.warn(res.debugLogs); }
    let data = res.stack.readCell();
    return { code: codeCell, data };
}

export const MapTestContract_errors: { [key: string]: string } = {
    '2': `Stack undeflow`,
    '3': `Stack overflow`,
    '4': `Integer overflow`,
    '5': `Integer out of expected range`,
    '6': `Invalid opcode`,
    '7': `Type check error`,
    '8': `Cell overflow`,
    '9': `Cell underflow`,
    '10': `Dictionary error`,
    '13': `Out of gas error`,
    '32': `Method ID not found`,
    '34': `Action is invalid or not supported`,
    '37': `Not enough TON`,
    '38': `Not enough extra-currencies`,
    '128': `Null reference exception`,
    '129': `Invalid serialization prefix`,
    '130': `Invalid incoming message`,
    '131': `Constraints error`,
    '132': `Access denied`,
    '133': `Contract stopped`,
}

export class MapTestContract {
    readonly executor: ContractExecutor; 
    constructor(executor: ContractExecutor) { this.executor = executor; } 
    
    async send(args: { amount: BN, from?: Address, debug?: boolean }, message: SetIntMap1 | SetIntMap2 | SetIntMap3 | SetIntMap4 | SetAddrMap1 | SetAddrMap2 | SetAddrMap3 | SetAddrMap4) {
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetIntMap1') {
            body = packSetIntMap1(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetIntMap2') {
            body = packSetIntMap2(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetIntMap3') {
            body = packSetIntMap3(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetIntMap4') {
            body = packSetIntMap4(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAddrMap1') {
            body = packSetAddrMap1(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAddrMap2') {
            body = packSetAddrMap2(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAddrMap3') {
            body = packSetAddrMap3(message);
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAddrMap4') {
            body = packSetAddrMap4(message);
        }
        if (body === null) { throw new Error('Invalid message type'); }
        try {
            let r = await this.executor.internal(new InternalMessage({
                to: this.executor.address,
                from: args.from || this.executor.address,
                bounce: false,
                value: args.amount,
                body: new CommonMessageInfo({
                    body: new CellMessage(body!)
                })
            }), { debug: args.debug });
            if (r.debugLogs.length > 0) { console.warn(r.debugLogs); }
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap1() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('intMap1', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap1Value(key: BN) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'int', value: key });
            let result = await this.executor.get('intMap1Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readBigNumberOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap2() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('intMap2', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap2Value(key: BN) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'int', value: key });
            let result = await this.executor.get('intMap2Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readBooleanOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap3() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('intMap3', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap3Value(key: BN) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'int', value: key });
            let result = await this.executor.get('intMap3Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap4() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('intMap4', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getIntMap4Value(key: BN) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'int', value: key });
            let result = await this.executor.get('intMap4Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            let pp = result.stack.pop();
            if (pp.type !== 'tuple') { return null; }
            return unpackTupleSomeStruct(new TupleSlice4(pp.items));
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap1() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('addrMap1', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap1Value(key: Address) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'slice', cell: beginCell().storeAddress(key).endCell() });
            let result = await this.executor.get('addrMap1Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readBigNumberOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap2() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('addrMap2', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap2Value(key: Address) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'slice', cell: beginCell().storeAddress(key).endCell() });
            let result = await this.executor.get('addrMap2Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readBooleanOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap3() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('addrMap3', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap3Value(key: Address) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'slice', cell: beginCell().storeAddress(key).endCell() });
            let result = await this.executor.get('addrMap3Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap4() {
        try {
            let __stack: StackItem[] = [];
            let result = await this.executor.get('addrMap4', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            return result.stack.readCellOpt();
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
    async getAddrMap4Value(key: Address) {
        try {
            let __stack: StackItem[] = [];
            __stack.push({ type: 'slice', cell: beginCell().storeAddress(key).endCell() });
            let result = await this.executor.get('addrMap4Value', __stack, { debug: true });
            if (result.debugLogs.length > 0) { console.warn(result.debugLogs); }
            let pp = result.stack.pop();
            if (pp.type !== 'tuple') { return null; }
            return unpackTupleSomeStruct(new TupleSlice4(pp.items));
        } catch (e) {
            if (e instanceof ExecuteError) {
                if (e.debugLogs.length > 0) { console.warn(e.debugLogs); }
                if (MapTestContract_errors[e.exitCode.toString()]) {
                    throw new Error(MapTestContract_errors[e.exitCode.toString()]);
                }
            }
            throw e;
        }
    }
}