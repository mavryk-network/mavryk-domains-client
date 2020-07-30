export abstract class Tracer {
    abstract trace(msg: any, ...args: any[]): void;
}

export class ConsoleTracer extends Tracer {
    trace(msg: any, ...args: any[]): void {
        console.trace(`[${new Date().toISOString()}] Trace`, msg, ...args);
    }
}

export class NoopTracer extends Tracer {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    trace(): void {}
}
