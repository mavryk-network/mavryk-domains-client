/** Get the tld part of the domain name. (i.e. `tez` if domain name is `bob.alice.tez`) */
export function getTld(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens[tokens.length - 1];
}

/** Get the label part of the domain name. (i.e. `bob` if domain name is `bob.alice.tez`) */
export function getLabel(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens.length > 1 ? tokens[0] : '';
}

/** Get the parent part of the domain name. (i.e. `alice.tez` if domain name is `bob.alice.tez`) */
export function getParent(name: string): string {
    return tokenizeDomainName(name).slice(1).join('.');
}

/** Get the domain name without the tld. (i.e. `bob.alice` if domain name is `bob.alice.tez`) */
export function stripTld(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens.slice(0, tokens.length - 1).join('.');
}

/** Get the domain level (i.e. 3, if domain name is `bob.alice.tez`) */
export function getLevel(name: string): number {
    const tokens = tokenizeDomainName(name);
    return tokens.length;
}

/** Splits the domain name into parts divided by `.` characters. */
export function tokenizeDomainName(name: string): string[] {
    return name.split('.');
}
