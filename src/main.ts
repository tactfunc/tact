import { CompilerContext, enable } from "./context";
import fs from 'fs';
import path from 'path';
import { getAllTypes, resolveDescriptors } from "./types/resolveDescriptors";
import { writeProgram } from "./generator/writeProgram";
import { resolveAllocations } from "./storage/resolveAllocation";
import { createABI } from "./generator/createABI";
import { openContext } from "./grammar/store";
import { resolveStatements } from "./types/resolveStatements";
import { resolvePackaging } from "./types/resolvePackaging";
import { parseImports } from "./grammar/grammar";
import { Config, parseConfig } from "./config/parseConfig";
import { compileContract } from "ton-compiler";
import { fromCode } from "tvm-disassembler";
import { Cell } from "ton";
import { ContractABI } from "./abi/ContractABI";
import { writeTypescript } from "./generator/writeTypescript";

function resolveLibraryPath(filePath: string, name: string) {

    // Check stdlib
    if (name.startsWith('@stdlib/')) {
        let p = name.substring('@stdlib/'.length);
        let pp = path.resolve(__dirname, '..', 'stdlib', p + '.tact')
        if (fs.existsSync(pp)) {
            return pp;
        } else {
            return null;
        }
    }

    let targetPath = path.resolve(filePath, '..', name + '.tact');
    if (fs.existsSync(targetPath)) {
        return targetPath;
    }

    return null;
}

export function precompile(ctx: CompilerContext, sourceFile: string) {

    // Load stdlib
    const stdlib = fs.readFileSync(__dirname + '/../stdlib/stdlib.tact', 'utf-8');
    const code = fs.readFileSync(sourceFile, 'utf8');

    //
    // Process imports
    // 
    const imported: string[] = [];
    let processed = new Set<string>();
    let pending: string[] = [];
    function processImports(path: string, source: string) {
        let imp = parseImports(source);
        for (let i of imp) {
            let resolved = resolveLibraryPath(path, i);
            if (!resolved) {
                throw Error('Unable to import file ' + i + ' from ' + path);
            }
            if (!processed.has(resolved)) {
                processed.add(resolved);
                pending.push(resolved);
            }
        }
    }
    processImports(path.resolve(__dirname, '/../stdlib/stdlib.tact'), stdlib);
    processImports(sourceFile, code);
    while (pending.length > 0) {
        let p = pending.shift()!;
        let librarySource = fs.readFileSync(p, 'utf8');
        imported.push(librarySource);
        processImports(p, librarySource);
    }

    // Perform initial compiler steps
    ctx = openContext(ctx, [stdlib, ...imported, code]);
    ctx = resolveDescriptors(ctx);
    ctx = resolveAllocations(ctx);
    ctx = resolveStatements(ctx);
    ctx = resolvePackaging(ctx);

    // Prepared context
    return ctx;
}

export function getContracts(ctx: CompilerContext) {
    return Object.values(getAllTypes(ctx)).filter((v) => v.kind === 'contract').map((v) => v.name);
}

export async function compile(ctx: CompilerContext, name: string | null) {
    let abi = createABI(ctx, name);
    let output = await writeProgram(ctx, abi);
    let cOutput = output;
    return { output: cOutput, ctx };
}

export async function compileProjects(configPath: string, projectNames: string[] = []) {

    // Load config
    let resolvedPath = path.resolve(configPath);
    let rootPath = path.dirname(resolvedPath);
    let config: Config;
    if (!fs.existsSync(resolvedPath)) {
        console.warn('Unable to find config file at ' + resolvedPath);
        return;
    }
    try {
        config = parseConfig(fs.readFileSync(resolvedPath, 'utf8'));
    } catch (e) {
        console.log(e);
        console.warn('Unable to parse config file at ' + resolvedPath);
        return;
    }

    // Resolve projects
    let projects = config.projects;
    if (projectNames.length > 0) {

        // Check that all proejct names are valid
        for (let pp of projectNames) {
            if (!projects.find((v) => v.name === pp)) {
                console.warn('Unable to find project ' + pp);
                return;
            }
        }

        // Filter by names
        projects = projects.filter((v) => projectNames.includes(v.name));
    }
    if (projects.length === 0) {
        console.warn('No projects to compile');
        return;
    }

    // Compile projects
    for (let project of projects) {

        // Start compilation
        console.log('💼 Compiling project ' + project.name + '...');

        // Configure compiler
        let ctx: CompilerContext = new CompilerContext({ shared: {} });
        if (project.experimental && project.experimental.inline) {
            console.warn('   > 👀 Enabling inline');
            ctx = enable(ctx, 'inline');
        }
        if (project.experimental && project.experimental.debug) {
            console.warn('   > 👀 Enabling debug');
            ctx = enable(ctx, 'debug');
        }

        // Resovle output path
        let outputPath = path.resolve(rootPath, project.output);
        try {
            ctx = precompile(ctx, project.path);
        } catch (e) {
            console.warn('Tact compilation failed');
            console.log(e);
            continue;
        }
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }

        // Compile contracts
        let ok = true;
        let built: { [key: string]: { code: string, abi: ContractABI } } = {};
        for (let contract of getContracts(ctx)) {
            let pathFc = path.resolve(outputPath, project.name + '_' + contract + ".fc");
            let pathBoc = path.resolve(outputPath, project.name + '_' + contract + ".boc");
            let pathFif = path.resolve(outputPath, project.name + '_' + contract + ".fif");
            let pathFifDec = path.resolve(outputPath, project.name + '_' + contract + ".rev.fif");
            let pathAbi = path.resolve(outputPath, project.name + '_' + contract + ".abi");
            let pathAbiIpfs = path.resolve(outputPath, project.name + '_' + contract + ".abi.ipfs");

            // Compiling contract to func
            console.log('   > ' + contract + ': tact compiler');
            let abiStr: string;
            try {
                let res = await compile(ctx, contract);
                fs.writeFileSync(pathFc, res.output.output);
                abiStr = res.output.abit;
            } catch (e) {
                console.warn('Tact compilation failed');
                console.warn(e);
                ok = false;
                continue;
            }

            // Compiling contract to TVM
            console.log('   > ' + contract + ': func compiler');
            let boc: Buffer;
            try {
                let c = await compileContract({ files: [pathFc] });
                if (!c.ok) {
                    console.warn(c.log);
                    ok = false;
                    continue;
                }
                fs.writeFileSync(pathFif, c.fift!);
                fs.writeFileSync(pathBoc, c.output!);
                boc = c.output!;
            } catch (e) {
                console.warn('FunC compiler crashed');
                console.warn(e);
                ok = false;
                continue;
            }

            // Cell -> Fift decompiler
            console.log('   > ' + contract + ': fift decompiler');
            try {
                let source = fromCode(Cell.fromBoc(boc)[0]);
                fs.writeFileSync(pathFifDec, source);
            } catch (e) {
                console.warn('Fift decompiler crashed, skipping...');
                console.warn(e);
                continue;
            }

            // Tact -> ABI
            let abi: ContractABI;
            try {
                console.log('   > ' + contract + ': abi generator');
                abi = createABI(ctx, contract);
                fs.writeFileSync(pathAbi, JSON.stringify(abi, null, 2));
                fs.writeFileSync(pathAbiIpfs, abiStr);
            } catch (e) {
                console.warn('ABI generation crashed');
                console.warn(e);
                ok = false;
                continue;
            }

            // Register results
            built[contract] = {
                code: boc.toString('base64'),
                abi
            };
        }
        if (!ok) {
            console.log('💥 Compilation failed. Skipping bindings generation');
            continue;
        }

        // Finalize compilation
        let contracts = project.contracts || getContracts(ctx);
        for (let contract of contracts) {
            console.log('   > ' + contract + ': bindings');
            let pathBindings = path.resolve(outputPath, project.name + '_' + contract + ".ts");
            let v = built[contract];
            let ts = writeTypescript(v.abi, v.code, built);
            fs.writeFileSync(pathBindings, ts);
        }
    }
} 