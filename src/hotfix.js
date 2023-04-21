export const hotfix={
    'y37':[
        [/<bibl><bibl>/g,'<bibl>',6],
        [/<\/bibl><\/bibl>/g,'</bibl>',6],
        ['<lb/>',''], //<note place="inline2">竺法護<lb/>釋法顯</note>
        ['<!--【待辦事項】厚觀法師案：必要時造字。待用SVG圖檔來處理標記。-->','']
    ],
    'y35':[ //只有此處會被 gen::tidy  <note place="inline">（大正(.+?)</note>  替換後會破壞標記結構
        ['</corr></choice>上</ref>）</note>' ,'</note></corr></choice>上</ref>）']
    ],
    'y40':[
        ['</corr></choice>‧六〇三上</ref>）</note>','</note></corr></choice>‧六〇三上</ref>）']

    ],
}