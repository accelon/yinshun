import { parseOfftext,removePunc } from "ptk/nodebundle.cjs";

export const toPaperPage=(content)=>{
    const pages={};
    let pb='-',prev=0;
    content.replace(/\^pb([\dab]+)/g,(m,m1,idx)=>{
        pages[pb]=content.slice(prev+m.length+1,idx).split('\t');
        pb=m1;
        prev=idx;
    })
    pages[pb]=content.slice(prev);


    return pages;    
}

export const getPageLineCh=(pages,pg,line,ch,toline,toch)=>{
    line=parseInt(line,10)-1;
    ch=parseInt(ch,10);
    toline=parseInt(toline,10)-1;
    toch=parseInt(toch,10);
    
    let out='';
    for (let i=line;i<=toline;i++) {
        if (!pages[pg]) {
        //    console.log('page not found',pg)
           continue;
        }
        if (!pages[pg][i]) continue;
        
        let [linetext]=parseOfftext(pages[pg][i]);
        linetext=removePunc(linetext.trim());
        // if (pg==1) console.log(pg,line,ch,toline,toch,linetext)
        if (i==line) {
            out=linetext.slice(ch, i==toline?toch:linetext.length);
        } else if (i==toline && i>line) {
            out+=linetext.slice(0,toch);
        } else {
            out+=linetext;
        }
    }
    return out;
}