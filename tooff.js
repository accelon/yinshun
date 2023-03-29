import {unique,alphabetically,Offtext,cjkPhrases,
    DOMFromString,walkDOM,
    removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged, readTextContent} from 'ptk/nodebundle.cjs'

await nodefs;
const folder='./yinshun-corpus/xml/';
const filename='y37.xml';
const content=readTextContent(folder+filename);

const xml2off=content=>{
    let offset=0,txt='',tagcount=0;
    const tree=DOMFromString(content);
    const ctx={out:''};
    const tags=[];
    const onOpen={
        '*':function(el){
            if (el.name) {
                el.count= ++tagcount;
                let attrs=JSON.stringify(el.attrs)
                if (attrs=='{}') attrs='';
                tags.push([el.count, offset,el.name, attrs]);
            }
        }
    }
    const onClose={
        '*':function(el){
            if (el.name) tags.push([el.count,offset]);
        }
    }
    const onText=(t)=>{
        txt+=t;
        offset+=t.length;
    }
    walkDOM(tree,ctx,onOpen,onClose,onText);
    return [tags,txt];
}

const [tags,txt]=xml2off(content);
writeChanged(filename+'.txt', txt,true);
writeChanged(filename+'.tsv', tags.map(it=>it.join('\t')).join('\n'),true);