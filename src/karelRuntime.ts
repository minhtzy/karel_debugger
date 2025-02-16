import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DebugProtocol } from '@vscode/debugprotocol';
import path from 'path';
import fs from 'fs';

export class KarelRuntime extends EventEmitter {
    private execPromise = promisify(exec);
    private breakpoints: Map<string, number[]> = new Map();
    private isPaused: boolean = false;

    public async compile(program: string, ktransPath?: string, options?: { 
        version?: string, 
        inifile?: string,
        buildTP?: boolean,
        maketpPath?: string 
    }): Promise<void> {
        // Create output directory at same level as source
        const sourceDir = path.dirname(program);
        const parentDir = path.dirname(sourceDir);
        const outputDir = path.join(parentDir, 'output');
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Determine if it's TP or Karel program and set appropriate extension
        const isTPProgram = options?.buildTP || program.toLowerCase().endsWith('.ls');
        const fileName = path.basename(program).replace(
            isTPProgram ? /\.ls$/i : /\.(kl|klh|klt)$/i,
            isTPProgram ? '.tp' : '.pc'
        );
        const outFile = path.join(outputDir, fileName);
        
        // Determine compiler executable path
        let compiler: string;
        if (isTPProgram) {
            if (options?.maketpPath) {
                const isDirectory = fs.existsSync(options.maketpPath) && fs.statSync(options.maketpPath).isDirectory();
                compiler = isDirectory ? path.join(options.maketpPath, 'maketp.exe') : options.maketpPath;
            } else {
                compiler = 'maketp';
            }
        } else {
            if (ktransPath) {
                const isDirectory = fs.existsSync(ktransPath) && fs.statSync(ktransPath).isDirectory();
                compiler = isDirectory ? path.join(ktransPath, 'ktrans.exe') : ktransPath;
            } else {
                compiler = 'ktrans';
            }
        }

        let command = `"${compiler}" "${program}" "${outFile}"`;
        
        if (options?.inifile) {
            command += ` /inifile "${options.inifile}"`;
        }
        if (options?.version) {
            command += ` /ver ${options.version}`;
        }
        
        try {
            const { stdout, stderr } = await this.execPromise(command);
            if (stderr) {
                throw new Error(`Compilation error: ${stderr}`);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes('not recognized') || msg.includes('cannot find')) {
                throw new Error(`${compiler} not found. Please add it to PATH or specify correct path in launch.json`);
            }
            throw new Error(`Failed to compile: ${msg}`);
        }
    }

    public async start(): Promise<void> {
        // Implementation for starting Karel program execution
        this.emit('stopOnEntry');
    }

    public setBreakpoints(path: string, lines: number[]): DebugProtocol.Breakpoint[] {
        this.breakpoints.set(path, lines);
        return lines.map(line => {
            return {
                verified: true,
                line
            };
        });
    }

    public continue(): void {
        this.isPaused = false;
        // Implementation for continuing execution
    }

    public pause(): void {
        this.isPaused = true;
        this.emit('stopOnPause');
    }
} 