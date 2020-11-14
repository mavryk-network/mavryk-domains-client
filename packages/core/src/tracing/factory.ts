import { ConsoleTracer, NoopTracer, Tracer } from './tracer';
import { TezosDomainsConfig } from '../model';

export function createTracer(config: TezosDomainsConfig): Tracer {
    return config.tracing ? new ConsoleTracer() : new NoopTracer();
}
