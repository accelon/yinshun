import { nodefs,insertBuf,readTextContent, breakChineseSentence, writeChanged } from "ptk/nodebundle.cjs";
import {conv} from './gen-base.js'
await nodefs
const from =0;
const count=45;
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

//causing nested note
//<note place="inline">（大正<ref type="taisho" target="vol:11;page:p515c">一一‧五一五下</ref>——<ref type="taisho" target="vol:11;page:p516b">五一六中</ref>）</note>

const tidy=content=>{
    return content.replace(/\n<pb/g,'<pb')
    //
    .replace(/<note place="inline">（大正(.+?)<\/note>/g,'（大正$1') //nested note with ref ,
    //
    .replace(/<note[^>]+>(<ref[^<]+)<\/note>/g,(m,m1)=>m1) //<note><ref></note> ==> <ref>
}
const ctx={idcount:0,distances:[],notes:{}}
files.forEach((file)=>{
    ctx.idcount=0;
    ctx.lbcount=0;
    const content=tidy(readTextContent(srcdir+file+'.xml'));

    const out=conv(content,file,ctx);


   
    let lines=out.split("\n");
    lines=lines.map( it=>breakChineseSentence(it).trim()).filter(it=>!!it.trim());
    let newcontent=lines.join('\n');

    const files=newcontent.split(/(\^bk[^\n]+)/);
    for (let i=1;i<files.length/2;i++) {
        const bkid=files[i*2-1].match(/#([a-z]+)/)[1];

        const newfilename=file.slice(1).toString().padStart(2,'0')+bkid;
        writeChanged(outdir+newfilename+'.off',files[i*2-1]+files[i*2],true); 
        if (ctx.notes[bkid]) {
            const notelines=ctx.notes[bkid].map(it=>breakChineseSentence(it)).filter(it=>!!it.trim());
            notelines.unshift('^bk#'+bkid+'_fn^ck#1'); //導師全集 -notes 不分 ck
            writeChanged(outdir+newfilename+'-notes.off',notelines.join('\n'),true)
        }
    }
})


//const distances=ctx.distances.sort((a,b)=>b[1]-a[1]).filter(it=>it[1]>50);
//console.log(distances)
