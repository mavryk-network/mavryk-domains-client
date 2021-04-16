import { getLabel, TLDConfigProperty } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';
import { TLDConfiguration } from './model';

export enum DomainAcquisitionState {
    Unobtainable = 'Unobtainable',
    Taken = 'Taken',
    CanBeBought = 'CanBeBought',
    CanBeAuctioned = 'CanBeAuctioned',
    AuctionInProgress = 'AuctionInProgress',
    CanBeSettled = 'CanBeSettled',
}

export interface DomainAcquisitionAuctionInfo {
    /** The amount of the last bid in mutez. */
    lastBid: number;
    /** The address of the sender of the last bid. */
    lastBidder: string | null;
    /** The minimum amount to outbid the current bid in mutez. (Value is `NaN` when auction is ended and waiting to be settled) */
    nextMinimumBid: number;
    /** The date at which the auction will end. This may change when bids are added towards the end of an auction. */
    auctionEnd: Date;
    /** The number of days that the domain will be registered for after an auction is settled. */
    registrationDuration: number;
    /** When a bid is made on an auction that will end in less milliseconds that this value, the end of auction is moved to this value of milliseconds from now. */
    bidAdditionalPeriod: number;
}

export interface DomainAcquisitionBuyOrRenewInfo {
    /** The price to buy or renew the domain for the minimum period [[`minDuration`]]. */
    pricePerMinDuration: number;
    /** The minimum duration in days for which it is possible to register or renew a domain. */
    minDuration: number;
}

export interface DomainAcquisitionUnobtainableInfo {
    /** The date since when it is possible to auction and buys this domain from the TLD registrar. */
    launchDate: Date | null;
}

export class DomainAcquisitionInfo {
    get acquisitionState(): DomainAcquisitionState {
        return this._state;
    }

    get auctionDetails(): DomainAcquisitionAuctionInfo {
        this.assertState(
            'auctionDetails',
            DomainAcquisitionState.CanBeAuctioned,
            DomainAcquisitionState.AuctionInProgress,
            DomainAcquisitionState.CanBeSettled
        );

        return this._auctionInfo!;
    }

    get buyOrRenewDetails(): DomainAcquisitionBuyOrRenewInfo {
        this.assertState('buyOrRenewDetails', DomainAcquisitionState.CanBeBought, DomainAcquisitionState.Taken);

        return this._buyOrRenewInfo!;
    }

    get unobtainableDetails(): DomainAcquisitionUnobtainableInfo {
        this.assertState('unobtainableDetails', DomainAcquisitionState.Unobtainable);

        return this._unobtainableInfo!;
    }

    /**
     * Calculates buy or renew price for this domain.
     *
     * @param duration The number of days for which to calculate the price.
     * @returns Price for owning the domain for the specified duration in mutez.
     */
    calculatePrice(duration: number): number {
        this.assertState('calculatePrice', DomainAcquisitionState.CanBeBought, DomainAcquisitionState.Taken);

        return this._buyOrRenewInfo!.pricePerMinDuration * (duration / this._buyOrRenewInfo!.minDuration);
    }

    private constructor(
        private _state: DomainAcquisitionState,
        private _auctionInfo?: DomainAcquisitionAuctionInfo,
        private _buyOrRenewInfo?: DomainAcquisitionBuyOrRenewInfo,
        private _unobtainableInfo?: DomainAcquisitionUnobtainableInfo
    ) {}

    /** @internal */
    static createUnobtainable(unobtainableInfo: DomainAcquisitionUnobtainableInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(DomainAcquisitionState.Unobtainable, undefined, undefined, unobtainableInfo);
    }

    /** @internal */
    static createAuction(state: DomainAcquisitionState, auctionInfo: DomainAcquisitionAuctionInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(state, auctionInfo);
    }

    /** @internal */
    static createBuyOrRenew(state: DomainAcquisitionState, fifsInfo: DomainAcquisitionBuyOrRenewInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(state, undefined, fifsInfo);
    }

    private assertState(description: string, ...allowedStates: DomainAcquisitionState[]) {
        if (!allowedStates.includes(this._state)) {
            throw new Error(`${description} is only available for states ${allowedStates.join(', ')}.`);
        }
    }
}

export interface AcquisitionInfoInput {
    tldConfiguration: Pick<
        TLDConfiguration,
        'minDuration' | 'minBidPerDay' | 'minAuctionPeriod' | 'minBidIncreaseRatio' | 'bidAdditionalPeriod' | 'launchDates'
    >;
    name: string;
    existingDomain?: {
        expiry: Date | null;
    };
    existingAuction?: {
        endsAt: Date;
        ownedUntil: Date;
        lastBid: number;
        lastBidder: string;
    };
}

export function calculateAcquisitionInfo(input: AcquisitionInfoInput): DomainAcquisitionInfo {
    const now = new Date();
    const label = getLabel(input.name);
    const minDuration = input.tldConfiguration.minDuration.toNumber();
    const minBid = getPricePerMinDuration(input.tldConfiguration.minBidPerDay);

    if (input.existingDomain && (!input.existingDomain.expiry || input.existingDomain.expiry > now)) {
        return createBuyOrRenewInfo(DomainAcquisitionState.Taken);
    }

    const defaultLaunchDateIndex = parseInt(TLDConfigProperty.DEFAULT_LAUNCH_DATE);
    let launchDate = input.tldConfiguration.launchDates[(defaultLaunchDateIndex + label.length).toString()];

    if (launchDate === undefined) {
        launchDate = input.tldConfiguration.launchDates[defaultLaunchDateIndex.toString()];
    }

    if (!launchDate) {
        return createUnobtainableInfo();
    }

    const minBidIncreaseCoef = input.tldConfiguration.minBidIncreaseRatio.dividedBy(100).plus(1).toNumber();
    const minAuctionPeriod = input.tldConfiguration.minAuctionPeriod.times(1000).toNumber();
    const bidAdditionalPeriod = input.tldConfiguration.bidAdditionalPeriod.times(1000).toNumber();

    if (input.existingAuction) {
        const maxSettlementDate = input.existingAuction.ownedUntil;
        if (now >= maxSettlementDate) {
            const maxNewAuctionDate = new Date(maxSettlementDate.getTime() + minAuctionPeriod);
            if (now < maxNewAuctionDate) {
                return createAuctionInfo(DomainAcquisitionState.CanBeAuctioned, maxNewAuctionDate, minBid);
            } else {
                return createBuyOrRenewInfo(DomainAcquisitionState.CanBeBought);
            }
        } else if (now < input.existingAuction.endsAt) {
            return createAuctionInfo(
                DomainAcquisitionState.AuctionInProgress,
                input.existingAuction.endsAt,
                Math.round((input.existingAuction.lastBid * minBidIncreaseCoef) / 1e5) * 1e5,
                input.existingAuction.lastBid,
                input.existingAuction.lastBidder
            );
        } else {
            return createAuctionInfo(
                DomainAcquisitionState.CanBeSettled,
                input.existingAuction.endsAt,
                NaN,
                input.existingAuction.lastBid,
                input.existingAuction.lastBidder
            );
        }
    } else {
        if (now < launchDate) {
            return createUnobtainableInfo();
        }

        const periodEndDate = input.existingDomain
            ? new Date(input.existingDomain.expiry!.getTime() + minAuctionPeriod)
            : new Date(launchDate.getTime() + minAuctionPeriod);
        if (now < periodEndDate) {
            return createAuctionInfo(DomainAcquisitionState.CanBeAuctioned, periodEndDate, minBid);
        } else {
            return createBuyOrRenewInfo(DomainAcquisitionState.CanBeBought);
        }
    }

    function createAuctionInfo(
        state: DomainAcquisitionState.CanBeAuctioned | DomainAcquisitionState.AuctionInProgress | DomainAcquisitionState.CanBeSettled,
        auctionEnd: Date,
        nextMinimumBid: number,
        lastBid?: number,
        lastBidder?: string
    ) {
        return DomainAcquisitionInfo.createAuction(state, {
            auctionEnd,
            nextMinimumBid,
            registrationDuration: minDuration,
            lastBid: lastBid == null ? 0 : lastBid,
            lastBidder: lastBidder || null,
            bidAdditionalPeriod,
        });
    }

    function createBuyOrRenewInfo(state: DomainAcquisitionState.CanBeBought | DomainAcquisitionState.Taken) {
        return DomainAcquisitionInfo.createBuyOrRenew(state, { pricePerMinDuration: minBid, minDuration });
    }

    function createUnobtainableInfo() {
        return DomainAcquisitionInfo.createUnobtainable({ launchDate: launchDate || null });
    }

    function getPricePerMinDuration(pricePerDay: BigNumber) {
        return pricePerDay.dividedBy(1e6).multipliedBy(minDuration).decimalPlaces(0, BigNumber.ROUND_HALF_UP).toNumber();
    }
}
