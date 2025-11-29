

export function generateJoinCode(prefix: string = 'ACAD'): string {
    const cleanPrefix = (prefix.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4) || 'ACAD');

    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const suffixLength = 4;
    let suffix = '';

    for (let i = 0; i < suffixLength; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        suffix += alphabet[randomIndex];
    }

    return `${cleanPrefix}-${suffix}`;
}
