export function maxDate(date1: Date, date2?: Date | null): Date {
    if (!date2) {
        return date1;
    }

    return date1 > date2 ? date1 : date2;
}
