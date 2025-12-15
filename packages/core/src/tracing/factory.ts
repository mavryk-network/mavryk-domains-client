import { ConsoleTracer, NoopTracer, Tracer } from './tracer';
import { MavrykDomainsConfig } from '../model';

export function createTracer(config: MavrykDomainsConfig): Tracer {
    return config.tracing ? new ConsoleTracer() : new NoopTracer();
}
