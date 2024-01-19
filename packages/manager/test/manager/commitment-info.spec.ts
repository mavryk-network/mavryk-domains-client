import { CommitmentInfo } from '@mavrykdynamics/mavryk-domains-manager';
import MockDate from 'mockdate';

describe('CommitmentInfo', () => {
    let commitment: CommitmentInfo;
    let now: Date;

    beforeEach(() => {
        now = new Date(2020, 3, 5, 6, 10, 0);

        MockDate.set(now);
        jest.useFakeTimers();
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('waitUntilUsable', () => {
        it('should resolve after commitment becomes usable', async () => {
            const spy = jest.fn();

            commitment = new CommitmentInfo(new Date(), new Date(now.getTime() + 12345), new Date());

            const promise = commitment.waitUntilUsable().then(spy);

            expect(spy).not.toHaveBeenCalled();
            
            jest.advanceTimersByTime(12345);

            await promise;

            expect(spy).toHaveBeenCalled();
        });
    });
});
