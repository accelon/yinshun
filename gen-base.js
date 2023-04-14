import {meta_cbeta,DOMFromString,walkDOM,xpath,nodefs,patchBuf} from 'ptk/nodebundle.cjs'
await nodefs;
import {onOpen,onClose,onText} from './src/handlers.js'
import {hotfix} from './src/hotfix.js'


const parseTEI=(content,filename,ctx)=>{
    content=meta_cbeta.nullify(content);
    const el=DOMFromString(content);
    const charmaps=meta_cbeta.buildCharMap(el); //CB缺字 及unicode/拼形式 對照表
    ctx.charmaps=charmaps;
    ctx.filename=filename;
    const body=xpath(el,'text/body');
    walkDOM(body,ctx,onOpen,onClose,onText);
    const str=ctx.out;
    ctx.out='';
    return str;
}

export const conv=(content,filename,ctx)=>{
    const errata=hotfix[filename];
    if (errata) {
        console.log('patching',filename)
        content=patchBuf(content,errata,filename)
    }
    content=parseTEI(content,filename,ctx);

    //content=content.replace(/「([^」]+)」(\^f\d+)/g,(m,t,f)=>f+'﹁'+t+'﹂');
    //.replace(/「([^」]+)」(\^f\d+)/g,(m,t,f)=>f+t)

    return content;
}