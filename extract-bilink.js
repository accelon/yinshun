import {unique,alphabetically,Offtext,cjkPhrases,
    removeBracket,alphabetically0, fromObj,
    nodefs,parseOfftext,readTextLines,  patchBuf,
    writeChanged, readTextContent, openInMemoryPtk} from 'ptk/nodebundle.cjs'

await nodefs;
const a17folder='yinshun-corpus/' ;//github.com/yinshun/yinshun-corpus
import { toPaperPage,getPageLineCh } from './src/backlink-acc17.js';
import { yinshun_pageunit } from './src/pageunit.js';
const bilink=JSON.parse(readTextContent(a17folder+'link-taisho-yinshun.json')).slice(1).map(it=>it.split('\t'));

const dump=(bkid)=>{
    const content=readTextContent('off/y'+bkid+'.off');
    const pages=toPaperPage(content);
    for (let i=0;i<bilink.length;i++) {
        const ys=bilink[i][0];
        //accelon2017 a01 , b01 增加頁元，
        //須換為 xml 的bkid
        const bkid_pu=yinshun_pageunit[parseInt(ys.slice(0,2))];
        if ( bkid_pu.slice(0,2) !== bkid)  continue;
        const [m,pg,line,ch,till]=ys.match(/p([\dab]+)\.(\d\d)(\d\d)\-(\d+)/);
        const prefix=bkid_pu.slice(2); // a, b

        let toline,toch;
        if (till.length>2) {
            toline=till.slice(0,2);
            toch=till.slice(2);
        } else {
            toline=line;
            toch=till;
        }
        const text=getPageLineCh(pages,prefix+pg,line,ch,toline,toch)
        console.log(text)
    
    }
}
dump('37');