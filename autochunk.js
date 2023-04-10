/* 產生 ck 插入表 */
import { nodefs, readTextContent, writeChanged } from "ptk/nodebundle.cjs";
await nodefs;
const from =0;
const count=45; //appendix.xml not included
const files=[] ,distances=[];
const srcdir='yinshun-corpus/xml/'
const outdir='ck/'
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}
let absln=0;
const docontent=(content,fn)=>{
    const lines=content.replace(/<lb\n/g,'<lb ').split(/(<lb n="[^"]+"\/>)/);
    let lb='', m0,pg,ln, prevln,prevpg=0,ck=0,prevabsln=absln,prevdepth=0;
    const out=[];
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        if (line.startsWith('<lb ')) {
            lb=line.match(/<lb n="([^"]+)"\/>/)[1];
            const m=lb.match(/([a-z\d]+)\.(\d+)/);
            if (!m) {
                console.log('wrong ln',fn,line)
            }
            [m0,pg,ln]=m;
            ln=parseInt(ln);
            if (isNaN(parseInt(pg))) pg=parseInt(pg.slice(1)) //page number a1, b1 
            else pg=parseInt(pg) + 100; // a, b 不會超過一百頁
            if (isNaN(pg)) console.log(pg)
            absln++;
        }

        let depth=0 , ckid=''; 
        // depth 較小者 有較高之優先權，
        if (line.startsWith('<div><head>')) depth=1;
        else if (~line.indexOf('<p type="head">') ) depth=1;
        else if (line.startsWith('<div><p>')) depth=2;//y25 壇經 424.15
        else if (line.startsWith('<q><p>')) depth=3;
        else if (~line.indexOf('<figure')) {
            const m=line.match(/(\d+)\.svg/);
            if (m) ckid='fig'+m[1];
            depth=3;
        }
        else if (line.startsWith('<q type="被解釋的引文">')) depth=3;
        else if (line.startsWith('<q type="被解釋的經論">')) depth=3;
        else if (line.startsWith('<q type="嚴謹引文">')) depth=3;
        else if (line.match(/<p>\d+\./)) depth=3;
        else if (line.startsWith('<p>')) depth=4;


        if (depth) {                       
            const dist=absln-prevabsln;
            //連續的科文只標第一個，最多隔5行
            //出現較上層的節點 即使隔3行內也切分
            if (lb &&(prevpg==0 || prevdepth>depth || dist>4))  {
                ck++;
                distances.push([dist, fn,lb])
                out.push(lb+'\t'+(ckid||ck)+'\t'+dist+'\t'
                //只留有attribute 的tag
                +line.replace(/<[\/a-zA-Z]+>/g,'').replace(/\n/g,'')
                .replace(/<(seg|pb|q) [^>]+>/g,'')
                //輸出短一點
                .replace(/[—。，？；：].+\n/,'\n')
                .trim())
                
                const reg=/([甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥])([一二三四五六七八九十]+)/
            }
            prevdepth=depth;
            prevln=ln; //上一個出現 head 的行
            prevpg=pg;
            prevabsln=absln;
        }
    
    }
    return out.filter(it=>it[0]!=='<');
}

files.forEach(file=>{
    const fileln=absln;
    const content=readTextContent(srcdir+file+'.xml');
    const out=docontent(content,file);
    // out.unshift('lb\tck\tcaption\tdistance')
    const written=writeChanged(outdir+file+'.ck.tsv_',out.join('\n')); 
    console.log(file,'chunk count',out.length, 'lines/ck',((absln-fileln)/out.length).toFixed(2) , written?'written':'');
    //rename to -ck.tsv after manual touch
})

distances.sort( (a,b)=>b[0]-a[0]);
console.log('total chunk count',distances.length);
writeChanged(outdir+'distances.tsv_',distances.filter(it=>it[0]>100).join('\n'),true)