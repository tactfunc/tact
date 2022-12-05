import { Cell, Slice, StackItem, Address, Builder } from 'ton';
import { BN } from 'bn.js';
import { deploy } from '../abi/deploy';

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: BigInt;
    mode: BigInt;
    body: Cell | null;
}

export function packSendParameters(src: SendParameters): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeBit(src.bounce);
    b_0 = b_0.storeAddress(src.to);
    b_0 = b_0.storeInt(new BN(src.value.toString(10), 10), 257);
    b_0 = b_0.storeInt(new BN(src.mode.toString(10), 10), 257);
    if (src.body !== null) {
        b_0 = b_0.storeBit(true);
        b_0 = b_0.storeRef(src.body);
    } else {
        b_0 = b_0.storeBit(false);
    }
    return b_0.endCell();
}

export type Operation = {
    $$type: 'Operation';
    seqno: BigInt;
    amount: BigInt;
    target: Address;
}

export function packOperation(src: Operation): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeUint(new BN(src.seqno.toString(10), 10), 32);
    b_0 = b_0.storeCoins(new BN(src.amount.toString(10), 10));
    b_0 = b_0.storeAddress(src.target);
    return b_0.endCell();
}

export type Execute = {
    $$type: 'Execute';
    operation: Operation;
    signature1: Slice;
    signature2: Slice;
    signature3: Slice;
}

export function packExecute(src: Execute): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeInt(819865922, 32);
    b_0 = b_0.storeCellCopy(packOperation(src.operation));
    b_0 = b_0.storeRef(src.signature1.toCell());
    b_0 = b_0.storeRef(src.signature2.toCell());
    b_0 = b_0.storeRef(src.signature3.toCell());
    return b_0.endCell();
}

export type Executed = {
    $$type: 'Executed';
    seqno: BigInt;
}

export function packExecuted(src: Executed): Cell {
    let b_0 = new Builder();
    b_0 = b_0.storeInt(4174937, 32);
    b_0 = b_0.storeUint(new BN(src.seqno.toString(10), 10), 32);
    return b_0.endCell();
}

export function MultisigContract_init(key1: BigInt, key2: BigInt, key3: BigInt) {
    const __code = 'te6ccgECOAEAAnMAART/APSkE/S88sgLAQIBYgIDAgLLBAUCASAuLwIBIAYHAgFIIiMCASAICQIBIBYXAgEgCgsCASAQEQIBIAwNAgEgDg8AOQx0h/tRNDwCzECghAw3ilCupXwCDHwFpEw4vANgAAkIG7yToAAPPpAAfpEbwKAAKRyWMsBcAHLACFvEAHKBwFvEQHL/4AIBIBITAgEgFBUAKzIcAHLAXMBywFwAcsAEszMyfkAbwKAAGRvI1Ajyx8B+gIB8AOAACzIAfAFyYAAVNMf+gDwAkMwbwOACASAYGQIBIB4fAgEgGhsCASAcHQAnPAHAdQB0AHUAdAB1AHQFEMwbwSAAGRvJFA0yx/L/8v/y/+AACzIAfAJyYAAZNMf0//T/9P/VTBvBIAAPXIAfAJye1UgCASAgIQB9MhxAcoBIW8QAcoAcAHKAiFvEfADIW8S+gJwAcpocAHKACFvFCBus5l/WMoAAfABAcyVMHABygDiyQFvE/sAgACscG1tbW8EUANxb4cBcm+HAXNvh/AKgAgEgJCUCASAqKwIBICYnAgEgKCkAHR/IW8SAm8REnBtbwXwDoAAPHDIycjJ8ASAABwgbxGAABwgbxKACASAsLQB1QgbxDwBvkAIW8RI28RIln5ECJvEiRvEiNZ+RAjbxMlbxMQJPkQI28QbxAlbxC68ooCsAGw8opvEPAQgABwgbxOAABwgbxCACASAwMQIBIDIzABe7ra7UTQ8Asx8BExgAF7jJftRNDwCzHwFTGAIBIDQ1AAm4rH8A+AIBIDY3ABe0fL2omh4BZj4CRjAAF7Dp+1E0PALMfAUMYAAXsOG7UTQ8Asx8BMxg';
    let __stack: StackItem[] = [];
    __stack.push({ type: 'int', value: new BN(key1.toString(), 10)});
    __stack.push({ type: 'int', value: new BN(key2.toString(), 10)});
    __stack.push({ type: 'int', value: new BN(key3.toString(), 10)});
    return deploy(__code, 'init_MultisigContract', __stack);
}
