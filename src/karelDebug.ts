import {
    Logger, logger,
    LoggingDebugSession,
    InitializedEvent, TerminatedEvent, StoppedEvent, BreakpointEvent, OutputEvent,
    Thread, StackFrame, Scope, Source, Handles
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { basename } from 'path';
import { KarelRuntime } from './karelRuntime';
import * as fs from 'fs';
import * as path from 'path';
import * as ftp from 'basic-ftp';
import * as dotenv from 'dotenv';

export class KarelDebugSession extends LoggingDebugSession {
    private static THREAD_ID = 1;
    private runtime: KarelRuntime;

    public constructor() {
        super("karel-debug");
        this.runtime = new KarelRuntime();

        this.runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new StoppedEvent('breakpoint', KarelDebugSession.THREAD_ID));
        });

        this.runtime.on('stopOnStep', () => {
            this.sendEvent(new StoppedEvent('step', KarelDebugSession.THREAD_ID));
        });

        this.runtime.on('end', () => {
            this.sendEvent(new TerminatedEvent());
        });
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        response.body = {
            ...response.body,
            supportsConfigurationDoneRequest: true,
            supportsStepBack: false,
            supportsBreakpointLocationsRequest: true
        };
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: any) {
        try {
            // Load environment variables from .env file
            dotenv.config();

            const sourceDir = args.sourceDirectory || path.dirname(args.program);
            const klFiles = fs.readdirSync(sourceDir)
                .filter(file => file.endsWith('.kl'));

            // Compile all .kl files
            for (const file of klFiles) {
                const fullPath = path.join(sourceDir, file);
                await this.runtime.compile(fullPath, args.ktransPath, {
                    version: args.version,
                    inifile: args.inifile
                });
            }

            // FTP Transfer if host is configured
            if (args.ftpConfig?.host) {
                const client = new ftp.Client();
                try {
                    await client.access({
                        host: args.ftpConfig.host,
                        user: process.env.KAREL_FTP_USER,
                        password: process.env.KAREL_FTP_PASSWORD,
                        port: args.ftpConfig.port || 21
                    });

                    // Upload all compiled .pc files
                    for (const file of klFiles) {
                        const pcFile = file.replace('.kl', '.pc');
                        const localPath = path.join(sourceDir, pcFile);
                        await client.uploadFrom(localPath, pcFile);
                    }
                } finally {
                    client.close();
                }
            }

            await this.runtime.start();
            this.sendResponse(response);
        } catch (err: unknown) {
            response.success = false;
            response.message = err instanceof Error ? err.message : String(err);
            this.sendResponse(response);
        }
    }

    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
        const path = args.source.path ?? '';
        const clientLines = args.lines || [];
        const breakpoints = this.runtime.setBreakpoints(path, clientLines);
        response.body = {
            breakpoints: breakpoints
        };
        this.sendResponse(response);
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
        this.runtime.continue();
        this.sendResponse(response);
    }

    protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
        this.runtime.pause();
        this.sendResponse(response);
    }
}