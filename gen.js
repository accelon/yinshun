import {unique,alphabetically,Offtext,breakChineseSentence,
    meta_cbeta,readTextContent,DOMFromString,walkDOM,xpath,
    cjkPhrases,removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
import {onOpen,onClose,onText} from './handlers.js'
import {hotfix} from './src/hotfix.js'

const a17folder='yinshun-corpus/' ;//github.com/yinshun/yinshun-corpus
const files=[];
const from =1;
const count=1;
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}
const ctx={};

const conv=(content,filename)=>{
    content=meta_cbeta.nullify(content);
    const el=DOMFromString(content);
    const charmaps=meta_cbeta.buildCharMap(el); //CB缺字 及unicode/拼形式 對照表
    ctx.charmaps=charmaps;
    ctx.filename=filename;
    const body=xpath(el,'text/body');
    walkDOM(body,ctx,onOpen,onClose,onText);
    return ctx.out;
}

const convall=()=>{
    files.forEach(filename=>{
        let content=readTextContent(a17folder+'/xml/'+filename+'.xml')
        const errata=hotfix[filename];
        if (errata) {
            console.log('patching',filename)
            content=patchBuf(content,errata,filename)
        }
        content=content.replace(/\n<pb/g,"<pb");//excessive \n
        content=conv(content,filename);
        const lines=content.split(/\r?\n/).map(line=>{
            if (line.charAt(0)=='◆') {
                return breakChineseSentence(line)
            }
            return line;
        }).filter(it=>!!it);
        
        writeChanged('off/'+filename+'.off',lines.join('\n'),true)
    })
};

convall();