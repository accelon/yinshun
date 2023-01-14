import {unique,alphabetically,Offtext,cjkPhrases,
    removeBracket,alphabetically0, fromObj,
    nodefs,parseOfftext,readTextLines,  patchBuf,
    writeChanged, readTextContent, openInMemoryPtk} from 'ptk/nodebundle.cjs'

await nodefs;
const a17folder='yinshun-corpus/' ;//github.com/yinshun/yinshun-corpus
import { toPaperPage,getPageLineCh } from './src/backlink-acc17.js';
const bilink=JSON.parse(readTextContent(a17folder+'link-taisho-yinshun.json')).slice(1).map(it=>it.split('\t'));

const dump=(bkid)=>{
    const content=readTextContent('off/y'+bkid+'.off');
    const pages=toPaperPage(content);
    const linkbookid='2'
    // console.log(bilink,content.length)
    for (let i=0;i<bilink.length;i++) {
        const ys=bilink[i][0];
        if (ys.startsWith(linkbookid+'p') ){
            
            const [m,pg,line,ch,till]=ys.match(/p([\dab]+)\.(\d\d)(\d\d)\-(\d+)/);
            let toline,toch;
            if (till.length>2) {
                toline=till.slice(0,2);
                toch=till.slice(2);
            } else {
                toline=line;
                toch=till;
            }
            const text=getPageLineCh(pages,pg,line,ch,toline,toch)
            if (i<5) console.log(ys,text)
        }
    }
}
dump('01');