export const KIND = {
    CONTENT: 0,
    TAG_OPEN: 1,
    TAG_CLOSE: 2,
}

export const MatchTagTextReg = {
    OPEN: /<([^>]+?)>/,
    CLOSE: /<\/([^/>]+?)>/,
    EMPTY_G: /<([^/>]+?)\/>/g,
}

export type Element = {
    kind: number;
    content: string;
}
