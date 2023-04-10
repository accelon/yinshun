import { nodefs,insertBuf,breakChineseSentence,readTextContent, readTextLines, writeChanged } from "ptk/nodebundle.cjs";
await nodefs
const from =1;
const count=1;
const files=[];
const srcdir='yinshun-corpus/xml/';
const ckdir='ck/';
const outdir='';
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}
//ck.tsv 由 autochunk.js 產生
//lb 可以帶pin。
const insertck=(content,fn)=>{
    const inserts=readTextLines(ckdir+fn+'.ck.tsv').map(it=>it.split('\t')).map( ([lb,ck])=>{
        let offset=0;
        if (lb.indexOf('>',1)<1 && lb.indexOf('<',1)<1 ) { // 沒有指定文字，到標記結尾
            lb+='"' 
            offset+=2;//跳過/>
        }
        return ['<lb\nn="'+lb,'<ck id="'+ck+'"/>',offset];
    });
    content=insertBuf(content,inserts,fn);
    return content
}

const docontent=(content,fn)=>{
    content=insertck(content,fn);
    return content;
}

files.forEach(file=>{
    const content=readTextContent(srcdir+file+'.xml');
    const out=docontent(content,file);
    writeChanged(outdir+file+'.ck.xml',out,true); 
    //rename to -ck.tsv after manual touch
})