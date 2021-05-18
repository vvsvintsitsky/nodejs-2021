export class TranslationDictionary {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    constructor(private dictionary: any) {}

    public getTranslation(key: string): string {
        const keyParts = key.split('.');

        let result = this.dictionary;
        for (let i = 0; i < keyParts.length; i++) {
            result = result[keyParts[i]];
            if (result === undefined || result === null) {
                break;
            }
        }

        return typeof result === 'string' ? result : key;
    }
}
