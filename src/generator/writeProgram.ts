import { ContractABI } from "../abi/ContractABI";
import { CompilerContext } from "../context";
import { getAllocation, getAllocations } from "../storage/resolveAllocation";
import { getAllStaticFunctions, getAllTypes } from "../types/resolveDescriptors";
import { TypeDescription } from "../types/types";
import { WriterContext } from "./Writer";
import { resolveFuncType } from "./writers/resolveFuncType";
import { writeParser, writeSerializer, writeStorageOps } from "./writers/writeSerialization";
import { writeStdlib } from "./writers/writeStdlib";
import { writeAccessors } from "./writers/writeAccessors";
import { beginCell } from "ton";
import { writeFunction, writeGetter, writeInit, writeReceiver } from "./writers/writeFunction";
import { contractErrors } from "../abi/errors";
import { writeInterfaces } from "./writers/writeInterfaces";
import { CID } from 'multiformats/cid';
import { calculateIPFSlink } from "../utils/calculateIPFSlink";

function writeMainContract(type: TypeDescription, abiLink: string, ctx: WriterContext) {

    // Main field
    ctx.fun('$main', () => {

        // Render body
        ctx.append(``)
        ctx.append(`() recv_internal(int msg_value, cell in_msg_cell, slice in_msg) impure {`);
        ctx.inIndent(() => {

            // Require context function
            ctx.used('__tact_context');

            // Load operation
            ctx.append();
            ctx.append(`;; Parse incoming message`);
            ctx.append(`int op = 0;`);
            ctx.append(`if (slice_bits(in_msg) >= 32) {`);
            ctx.inIndent(() => {
                ctx.append(`op = in_msg.preload_uint(32);`);
            });
            ctx.append(`}`);
            ctx.append(`var cs = in_msg_cell.begin_parse();`);
            ctx.append(`var msg_flags = cs~load_uint(4);`); // int_msg_info$0 ihr_disabled:Bool bounce:Bool bounced:Bool
            ctx.append(`var msg_bounced = ((msg_flags & 1) == 1 ? true : false);`);
            ctx.append(`slice msg_sender_addr = cs~load_msg_addr();`);
            ctx.append(`__tact_context = (msg_bounced, msg_sender_addr, msg_value);`);
            ctx.append();

            // Handle bounced
            ctx.append(`;; Handle bounced messages`);
            ctx.append(`if (msg_bounced) {`);
            ctx.inIndent(() => {
                let bouncedHandler = type.receivers.find(f => f.selector.kind === 'internal-bounce');
                if (bouncedHandler) {

                    // Load storage
                    ctx.used(`__gen_load_${type.name}`);
                    ctx.append(`var self = __gen_load_${type.name}();`);

                    // Execute function
                    ctx.used(`__gen_${type.name}_receive_bounced`);
                    ctx.append(`self~__gen_${type.name}_receive_bounced(in_msg);`);

                    // Persist
                    ctx.used(`__gen_store_${type.name}`);
                    ctx.append(`__gen_store_${type.name}(self);`);
                    ctx.append(`return ();`);
                } else {
                    ctx.append(`return ();`);
                }
            });
            ctx.append(`}`);

            // Non-empty receivers
            for (const f of type.receivers) {
                const selector = f.selector;

                // Generic receiver
                if (selector.kind === 'internal-binary') {
                    let allocation = getAllocation(ctx.ctx, selector.type);
                    if (!allocation.prefix) {
                        throw Error('Invalid allocation');
                    }
                    ctx.append();
                    ctx.append(`;; Receive ${selector.type} message`);
                    ctx.append(`if (op == ${allocation.prefix}) {`);
                    ctx.inIndent(() => {

                        // Load storage
                        ctx.used(`__gen_load_${type.name}`);
                        ctx.append(`var self = __gen_load_${type.name}();`);

                        // Read message
                        ctx.used(`__gen_read_${selector.type}`);
                        ctx.append(`var msg = in_msg~__gen_read_${selector.type}();`);

                        // Execute function
                        ctx.used(`__gen_${type.name}_receive_${selector.type}`);
                        ctx.append(`self~__gen_${type.name}_receive_${selector.type}(msg);`);

                        // Persist
                        ctx.used(`__gen_store_${type.name}`);
                        ctx.append(`__gen_store_${type.name}(self);`);

                        // Exit
                        ctx.append(`return ();`);
                    })
                    ctx.append(`}`);
                }

                if (selector.kind === 'internal-empty') {
                    ctx.append();
                    ctx.append(`;; Receive empty message`);
                    ctx.append(`if ((op == 0) & (slice_bits(in_msg) <= 32)) {`);
                    ctx.inIndent(() => {

                        // Load storage
                        ctx.used(`__gen_load_${type.name}`);
                        ctx.append(`var self = __gen_load_${type.name}();`);

                        // Execute function
                        ctx.used(`__gen_${type.name}_receive`);
                        ctx.append(`self~__gen_${type.name}_receive();`);

                        // Persist
                        ctx.used(`__gen_store_${type.name}`);
                        ctx.append(`__gen_store_${type.name}(self);`);

                        // Exit
                        ctx.append(`return ();`);
                    })
                    ctx.append(`}`);
                }
            }

            // Text resolvers
            let hasComments = !!type.receivers.find((v) => v.selector.kind === 'internal-comment');
            if (hasComments) {
                ctx.append();
                ctx.append(`;; Text Receivers`);
                ctx.append(`if (op == 0) {`);
                ctx.inIndent(() => {
                    ctx.append(`var text_op = slice_hash(in_msg);`);
                    for (const r of type.receivers) {
                        const selector = r.selector;
                        if (selector.kind === 'internal-comment') {
                            let hash = beginCell()
                                .storeUint(0, 32)
                                .storeBuffer(Buffer.from(selector.comment, 'utf8'))
                                .endCell()
                                .hash()
                                .toString('hex', 0, 64);
                            ctx.append();
                            ctx.append(`;; Receive "${selector.comment}" message`);
                            ctx.append(`if (text_op == 0x${hash}) {`);
                            ctx.inIndent(() => {

                                // Load storage
                                ctx.used(`__gen_load_${type.name}`);
                                ctx.append(`var self = __gen_load_${type.name}();`);

                                // Execute function
                                ctx.used(`__gen_${type.name}_receive_comment_${hash}`);
                                ctx.append(`self~__gen_${type.name}_receive_comment_${hash}();`);

                                // Persist
                                ctx.used(`__gen_store_${type.name}`);
                                ctx.append(`__gen_store_${type.name}(self);`);

                                // Exit
                                ctx.append(`return ();`);
                            })
                            ctx.append(`}`);
                        }
                    }
                });
                ctx.append(`}`);
            }

            // Fallback
            let fallbackReceiver = type.receivers.find((v) => v.selector.kind === 'internal-fallback');
            if (fallbackReceiver) {

                ctx.append();
                ctx.append(`;; Receiver fallback`);

                // Load storage
                ctx.used(`__gen_load_${type.name}`);
                ctx.append(`var self = __gen_load_${type.name}();`);

                // Execute function
                ctx.used(`__gen_${type.name}_receive_fallback`);
                ctx.append(`self~__gen_${type.name}_receive_fallback(in_msg);`);

                // Persist
                ctx.used(`__gen_store_${type.name}`);
                ctx.append(`__gen_store_${type.name}(self);`);

            } else {
                ctx.append();
                ctx.append(`throw(${contractErrors.invalidMessage.id});`);
            }
        });
        ctx.append('}');
        ctx.append();

        // Init method
        if (type.init) {
            ctx.append(`cell init_${type.name}(${[`cell sys'`, ...type.init.args.map((a) => resolveFuncType(a.type, ctx) + ' ' + a.name)].join(', ')}) method_id {`);
            ctx.inIndent(() => {
                ctx.used(`__gen_${type.name}_init`);
                ctx.append(`return __gen_${type.name}_init(${[`sys'`, ...type.init!.args.map((a) => a.name)].join(', ')});`);
            });
            ctx.append(`}`);
            ctx.append();
        }

        // Implicit dependencies
        for (let f of Object.values(type.functions)) {
            if (f.isGetter) {
                ctx.used(`__gen_get_${f.name}`);
            }
        }

        // Interfaces
        writeInterfaces(type, ctx);

        // ABI
        ctx.append(`_ get_abi_ipfs() {`);
        ctx.inIndent(() => {
            ctx.append(`return "${abiLink}";`);
        });
        ctx.append(`}`);
    });
}

export async function writeProgram(ctx: CompilerContext, abi: ContractABI, debug: boolean = false) {
    const wctx = new WriterContext(ctx);
    let allTypes = Object.values(getAllTypes(ctx));
    let contracts = allTypes.filter((v) => v.kind === 'contract');

    // Stdlib
    writeStdlib(wctx);

    // Serializators
    let allocations = getAllocations(ctx);
    for (let k of allocations) {
        writeSerializer(k.type.name, k.allocation, wctx);
        writeParser(k.type.name, k.allocation, wctx);
    }

    // Accessors
    for (let t of allTypes) {
        if (t.kind === 'contract' || t.kind === 'struct') {
            writeAccessors(t, wctx);
        }
    }

    // Storage Functions
    for (let k of allocations) {
        if (k.type.kind === 'contract') {
            writeStorageOps(k.type, wctx);
        }
    }

    // Static functions
    let sf = getAllStaticFunctions(ctx);
    for (let k in sf) {
        let f = sf[k];
        writeFunction(f, wctx);
    }

    // Extensions
    for (let c of allTypes) {
        if (c.kind !== 'contract' && c.kind !== 'trait') { // We are rendering contract functions separately
            for (let f of Object.values(c.functions)) {
                writeFunction(f, wctx);
            }
        }
    }

    // Contract functions
    for (let c of contracts) {

        // Init
        if (c.init) {
            writeInit(c, c.init, wctx);
        }

        // Functions
        for (let f of Object.values(c.functions)) {
            writeFunction(f, wctx);

            // Render only needed getter
            if (c.name === abi.name) {
                if (f.isGetter) {
                    writeGetter(f, wctx);
                }
            }
        }

        // Receivers
        for (let r of Object.values(c.receivers)) {
            writeReceiver(c, r, wctx);
        }
    }

    // Find contract
    let c = contracts.find((v) => v.name === abi.name);
    if (!c) {
        throw Error(`Contract ${abi.name} not found`);
    }

    // Prepare ABI
    let abiStr = JSON.stringify(abi);
    let abiLink = await calculateIPFSlink(Buffer.from(abiStr));

    // Write contract
    writeMainContract(c, abiLink, wctx);

    // Render output
    let output = wctx.render(debug);
    return { output, abit: abiStr };
}