import { Tracer, ConsoleTracer } from '@tezos-domains/core';
import MockDate from 'mockdate';

describe('Tracer', () => {
    let tracer: Tracer;

    describe('ConsoleTracer', () => {
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleSpy = jest.spyOn(global.console, 'trace').mockImplementation(void 0);

            MockDate.set(new Date(2020, 9, 11, 20, 10, 35));

            tracer = new ConsoleTracer();
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('should log to console', () => {
            tracer.trace('some msg', 'arg1', 'arg2');

            expect(consoleSpy).toHaveBeenCalledWith('[2020-10-11T18:10:35.000Z] Trace', 'some msg', 'arg1', 'arg2');
        });
    });
});
