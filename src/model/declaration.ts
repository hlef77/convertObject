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

export const defaultXml = 
    "<帳簿>\n" +
    "\t<支出>\n" +
    "\t\t<内容>\n" +
    "\t\t\t<日付>1月20日</日付>\n" +
    "\t\t\t<交通費>780</交通費>\n" +
    "\t\t\t<食費>980</食費>\n" +
    "\t\t\t<嗜好品>250</嗜好品>\n" +
    "\t\t</内容>\n" +
    "\t\t<内容>\n" +
    "\t\t\t<日付>1月21日</日付>\n" +
    "\t\t\t<交通費>950</交通費>\n" +
    "\t\t\t<食費>1200</食費>\n" +
    "\t\t\t<嗜好品>300</嗜好品>\n" +
    "\t\t</内容>\n" +
    "\t\t<内容>\n" +
    "\t\t\t<日付>1月22日</日付>\n" +
    "\t\t\t<交通費>500</交通費>\n" +
    "\t\t\t<食費>1500</食費>\n" +
    "\t\t\t<嗜好品>250</嗜好品>\n" +
    "\t\t</内容>\n" +
    "\t</支出>\n" +
    "</帳簿>"