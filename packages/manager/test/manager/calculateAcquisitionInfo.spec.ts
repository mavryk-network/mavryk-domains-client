import { calculateAcquisitionInfo, DomainAcquisitionState } from '../../src/manager/acquisition-info';
import { TLDConfiguration } from '../../src/manager/model';

describe('calculateAcquisitionInfo', () => {
    it('should return claimable info', () => {
        const tldConfiguration = <TLDConfiguration>{ isClaimable: true };

        const result = calculateAcquisitionInfo({ name: 'test.com', tldConfiguration });

        expect(result.acquisitionState).toBe(DomainAcquisitionState.CanBeClaimed);
    });
});
