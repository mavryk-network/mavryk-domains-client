export interface Tracer {
    trace(msg: any, ...args: any[]): void;
}

export class ConsoleTracer implements Tracer {
    trace(msg: any, ...args: any[]): void {
        console.debug(`[${new Date().toISOString()}] TezosDomains`, msg, ...args);
    }
}

export class NoopTracer implements Tracer {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    trace(): void {}
}
