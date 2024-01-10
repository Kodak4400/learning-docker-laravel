export function stringToBoolean(value: unknown): boolean {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    return value === true || value === 1;
}

export function uppercaseFirstCharacter(value: string) {
    const words = value.split('-');
    if (words.length) {
        const word = words.join('');
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}
