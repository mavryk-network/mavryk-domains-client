export function getTld(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens[tokens.length - 1];
}

export function getLabel(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens.length > 1 ? tokens[0] : '';
}

export function getParent(name: string): string {
    return tokenizeDomainName(name).slice(1).join('.');
}

export function stripTld(name: string): string {
    const tokens = tokenizeDomainName(name);
    return tokens.slice(0, tokens.length - 1).join('.');
}

export function getLevel(name: string): number {
    const tokens = tokenizeDomainName(name);
    return tokens.length;
}

export function tokenizeDomainName(name: string): string[] {
    return name.split('.');
}
