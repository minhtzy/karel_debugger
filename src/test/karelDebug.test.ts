import { KarelDebugSession } from '../karelDebug';
import { expect } from 'chai';
import * as path from 'path';
import { DebugProtocol } from '@vscode/debugprotocol';

// Create a test subclass to access protected methods
class TestDebugSession extends KarelDebugSession {
    public callInitialize(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        this.initializeRequest(response, args);
    }

    public callLaunch(response: DebugProtocol.LaunchResponse, args: any): void {
        this.launchRequest(response, args);
    }

    public callSetBreakpoints(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
        this.setBreakPointsRequest(response, args);
    }
}

describe('KarelDebugSession', () => {
    let session: TestDebugSession;

    beforeEach(() => {
        session = new TestDebugSession();
    });

    describe('initialization', () => {
        it('should initialize with correct capabilities', (done) => {
            const response: DebugProtocol.InitializeResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'initialize',
                body: {}
            };

            session.callInitialize(response, {
                adapterID: 'karel',
                linesStartAt1: true,
                columnsStartAt1: true,
                pathFormat: 'path'
            });

            expect(response.body).to.include({
                supportsConfigurationDoneRequest: true,
                supportsStepBack: false,
                supportsBreakpointLocationsRequest: true
            });
            done();
        });
    });

    describe('launch', () => {
        it('should handle launch request', async () => {
            const response: DebugProtocol.LaunchResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'launch'
            };

            const args = {
                program: path.join(__dirname, 'fixtures', 'test.kl'),
                ktransPath: 'ktrans',
                version: '2.3'
            };

            await session.callLaunch(response, args);
            expect(response.success).to.be.true;
        });
    });

    describe('breakpoints', () => {
        it('should set breakpoints', (done) => {
            const response: DebugProtocol.SetBreakpointsResponse = {
                seq: 0,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'setBreakpoints',
                body: { breakpoints: [] }
            };

            const args: DebugProtocol.SetBreakpointsArguments = {
                source: { path: 'test.kl' },
                lines: [1, 2, 3],
                breakpoints: [
                    { line: 1 },
                    { line: 2 },
                    { line: 3 }
                ]
            };

            session.callSetBreakpoints(response, args);
            expect(response.body.breakpoints).to.have.lengthOf(3);
            response.body.breakpoints.forEach(bp => {
                expect(bp.verified).to.be.true;
            });
            done();
        });
    });
}); 