import { KarelRuntime } from '../karelRuntime';
import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

describe('KarelRuntime', () => {
    let runtime: KarelRuntime;
    const testProgramPath = path.join(__dirname, 'fixtures', 'test.kl');
    const outputDir = path.join(__dirname, 'fixtures', 'output');

    beforeEach(() => {
        runtime = new KarelRuntime();
        // Create test program file if it doesn't exist
        if (!fs.existsSync(path.dirname(testProgramPath))) {
            fs.mkdirSync(path.dirname(testProgramPath), { recursive: true });
        }
        fs.writeFileSync(testProgramPath, 'PROGRAM test\nBEGIN\nEND test');
    });

    afterEach(() => {
        // Cleanup
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    });

    describe('compile', () => {
        it('should compile Karel program successfully', async () => {
            await runtime.compile(testProgramPath);
            // If no error is thrown, the test passes
        });

        it('should throw error when compiler not found', async () => {
            try {
                await runtime.compile(testProgramPath, 'invalid-ktrans-path');
                expect.fail('Should have thrown an error');
            } catch (error: unknown) {
                if (error instanceof Error) {
                    expect(error.message).to.include('ktrans not found');
                } else {
                    throw error;
                }
            }
        });

        it('should handle TP program compilation', async () => {
            const tpProgramPath = path.join(__dirname, 'fixtures', 'test.ls');
            fs.writeFileSync(tpProgramPath, 'PROGRAM test\nBEGIN\nEND test');
            await runtime.compile(tpProgramPath, undefined, { buildTP: true });
            // If no error is thrown, the test passes
        });
    });

    describe('breakpoints', () => {
        it('should set breakpoints correctly', () => {
            const breakpoints = runtime.setBreakpoints(testProgramPath, [1, 2, 3]);
            expect(breakpoints).to.have.lengthOf(3);
            breakpoints.forEach(bp => {
                expect(bp.verified).to.be.true;
            });
        });
    });

    describe('execution control', () => {
        it('should emit stopOnEntry event when started', (done) => {
            runtime.on('stopOnEntry', () => {
                done();
            });
            runtime.start();
        });

        it('should handle pause and continue', () => {
            runtime.continue();
            expect((runtime as any).isPaused).to.be.false;
            
            runtime.pause();
            expect((runtime as any).isPaused).to.be.true;
        });
    });
}); 