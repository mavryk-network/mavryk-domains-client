import { createTracer, Tracer } from '@tezos-domains/core';
import MockDate from 'mockdate';

describe('Tracer', () => {
    let tracer: Tracer;

    describe('ConsoleTracer', () => {
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleSpy = jest.spyOn(global.console, 'debug').mockImplementation(void 0);

            const date = new Date(2020, 9, 11, 20, 10, 35);
            MockDate.set(new Date(date.getTime() - date.getTimezoneOffset() * 60000));

            tracer = createTracer({ tracing: true });
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('should log to console', () => {
            tracer.trace('some msg', 'arg1', 'arg2');

            expect(consoleSpy).toHaveBeenCalledWith('[2020-10-11T20:10:35.000Z] TezosDomains', 'some msg', 'arg1', 'arg2');
        });
    });
});
