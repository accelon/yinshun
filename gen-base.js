import {unique,alphabetically,Offtext,breakChineseSentence,
    meta_cbeta,readTextContent,DOMFromString,walkDOM,xpath,
    cjkPhrases,removeBracket,alphabetically0, fromObj,nodefs,parseOfftext,readTextLines, writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
import {onOpen,onClose,onText} from './handlers.js'
import {hotfix} from './src/hotfix.js'

const accelon17folder='yinshun-corpus/' ;//github.com/yinshun/yinshun-corpus

const ctx={};

const parseTEI=(content,filename)=>{
    content=meta_cbeta.nullify(content);
    const el=DOMFromString(content);
    const charmaps=meta_cbeta.buildCharMap(el); //CB缺字 及unicode/拼形式 對照表
    ctx.charmaps=charmaps;
    ctx.filename=filename;
    const body=xpath(el,'text/body');
    walkDOM(body,ctx,onOpen,onClose,onText);
    return ctx.out;
}

export const convall=(files,docontent)=>{
    files.forEach(filename=>{
        let content=readTextContent(accelon17folder+'/xml/'+filename+'.xml')
        const errata=hotfix[filename];
        if (errata) {
            console.log('patching',filename)
            content=patchBuf(content,errata,filename)
        }
        content=content.replace(/\n<pb/g,"<pb");//excessive \n
        content=parseTEI(content,filename);

        const [err,lines]=docontent(content);
        if (!err) {
            writeChanged('off/'+filename+'.off',lines.join('\n'),true)
        } else {
            console.log(err);
        }
       
    })
};

