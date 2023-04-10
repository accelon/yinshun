import {meta_cbeta,DOMFromString,walkDOM,xpath,nodefs,writeChanged} from 'ptk/nodebundle.cjs'
await nodefs;
import {onOpen,onClose,onText} from './src/handlers.js'
import {hotfix} from './src/hotfix.js'

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

export const conv=(buf,fn)=>{
    const errata=hotfix[filename];
    if (errata) {
        console.log('patching',filename)
        content=patchBuf(content,errata,filename)
    }
    content=parseTEI(content,filename);
    const [err,lines]=docontent(content,filename);
    if (!err) {
        writeChanged('off/'+filename+'.off',lines.join('\n'),true)
    } else {
        console.log(err);
    }
}