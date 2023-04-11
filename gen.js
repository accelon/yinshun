import { nodefs,insertBuf,readTextContent, breakChineseSentence, writeChanged } from "ptk/nodebundle.cjs";
import {conv} from './gen-base.js'
await nodefs
const from =1;
const count=3;
const files=[];
const srcdir='yinshun-corpus/xml/';
const ckdir='ck/';
const outdir='off/';
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}
//ck.tsv 由 autochunk.js 產生
//lb 可以帶pin。
// const insertck=(content,fn)=>{
//     const inserts=readTextLines(ckdir+fn+'.ck.tsv').map(it=>it.split('\t')).map( ([lb,ck])=>{
//         let offset=0;
//         if (lb.indexOf('>',1)<1 && lb.indexOf('<',1)<1 ) { // 沒有指定文字，到標記結尾
//             lb+='"' 
//             offset+=2;//跳過/>
//         }
//         return ['<lb\nn="'+lb,'<ck id="'+ck+'"/>',offset];
//     });
//     content=insertBuf(content,inserts,fn);
//     return content
// }

const docontent=(content,fn)=>{
    // content=insertck(content,fn);
    return content;
}

const ctx={idcount:0,distances:[]}
files.forEach((file,nfile)=>{
    ctx.idcount=0;
    ctx.lbcount=0;
    const content=readTextContent(srcdir+file+'.xml').replace(/\n<pb/g,'<pb');
    const out=conv(content,file,ctx);


    let lines=out.split("\n");
    lines=lines.map( it=>breakChineseSentence(it).trim()).filter(it=>!!it.trim());
    let newcontent=lines.join('\n');
    

    const files=newcontent.split(/(\^bk[^\n]+)/);
    for (let i=1;i<files.length/2;i++) {
        const bkid=files[i*2-1].match(/#([a-z]+)/)[1];
        const newfilename=(nfile+1).toString().padStart(2,'0')+bkid;
        writeChanged(outdir+newfilename+'.off',files[i*2-1]+files[i*2],true); 
        if (ctx.notes[bkid]) {
            const notelines=ctx.notes[bkid].map(it=>breakChineseSentence(it)).filter(it=>!!it.trim());
            writeChanged(outdir+newfilename+'-notes.off',notelines.join('\n'),true)
        }
    }
})


const distances=ctx.distances.sort((a,b)=>b[1]-a[1]).filter(it=>it[1]>50);
console.log(distances)
