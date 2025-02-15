import { ASTFunction, ASTNativeFunction, ASTType } from "./ast";
import { CompilerContext, createContextStore } from "../context";
import { parse } from "./grammar";

type ASTStore = { functions: (ASTFunction | ASTNativeFunction)[], types: ASTType[] };

const store = createContextStore<ASTStore>();

export function getRawAST(ctx: CompilerContext) {
    let r = store.get(ctx, 'types');
    if (!r) {
        throw Error('No AST found in context');
    }
    return r;
}

export function openContext(ctx: CompilerContext, sources: string[]) {
    let asts = sources.map(source => parse(source));
    let types: ASTType[] = [];
    let functions: (ASTNativeFunction | ASTFunction)[] = [];
    for (let a of asts) {
        for (let e of a.entries) {
            if (e.kind === 'def_struct' || e.kind === 'def_contract' || e.kind === 'def_trait' || e.kind === 'primitive') {
                types.push(e);
            } else if (e.kind === 'def_function' || e.kind === 'def_native_function') {
                functions.push(e);
            }
        }
    }
    ctx = store.set(ctx, 'types', { functions, types });
    return ctx;
}