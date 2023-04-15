// import {p2otxt,head2ck} from './chunks.js'
import {meta_cbeta,toBase26,makeElementId} from 'ptk/nodebundle.cjs'

const makeId=(ctx)=>{
    if (!ctx.n) return '';
    const m=ctx.n.match(/(\d+)\.(\d+)/);
    const id=parseInt(m[1])+toBase26(parseInt(m[2])-1);
    if (ctx.previd==id) return '';

    if (!ctx.idcount) ctx.idcount=0;
    ctx.idcount++;
    ctx.previd=id;
    ctx.previdline=ctx.prevlbcount;
    return id;
}

const emitID=(el,ctx,weight=0)=>{
    const id=makeId(ctx);
    if (!id) return ''; //already emit in this line
    let tag='p';

    if (!ctx.prevlbcount) ctx.prevlbcount=0;
    if (!ctx.prevckline) ctx.prevckline=0;
    if (!ctx.prevckweight) ctx.prevckweight=0;

    const dist  =ctx.lbcount - ctx.prevlbcount;
    const ckdist=ctx.lbcount - ctx.prevckline;
    
    if ( weight && ckdist>4 && weight>= ctx.prevckweight) {
        tag='ck';
        ctx.prevckweight=weight; //記下目前ck的權重
        ctx.prevckline=ctx.lbcount;
    } else {
        ctx.prevckweight=0;
    }
    ctx.compact=true;
    const emit='\n^'+tag+id;

    ctx.distances.push([ctx.bk+id, dist ]);
    ctx.prevlbcount=ctx.lbcount;
    
    return emit;
}
export const onOpen={
    milestone:(el,ctx)=>{ //2023.4.11 之後新增 到 github.com/yinshun/yinshun-corpus
        // console.log(el.attrs.id);
        if (el.attrs.type) {
            if (el.attrs.type=="bk") ctx.bk=el.attrs.id;
            ctx.depthcounts=[];
            const title=el.attrs.title;
            return '^'+makeElementId(el.attrs.type,el.attrs.id)+(title?'【'+title+'】':'');   
        }
    },
    lb:(el,ctx)=>{
        if (!ctx.lbcount) ctx.lbcount=0;
        ctx.lbcount++;
        if ('old'!==el.attrs.type) { //cbeta 有新舊兩版頁碼。 yinshun-corpus 只有舊版頁碼
            ctx.n=el.attrs.n;
        }
        if (ctx.breaklb) return '\n';
    },
    head:(el,ctx)=>{
        if (!ctx.depthcounts) ctx.depthcounts=[];
        ctx.depthcounts.length=ctx.divdepth;
        if (!ctx.depthcounts[ctx.divdepth-1]) ctx.depthcounts[ctx.divdepth-1]=0;
        ctx.depthcounts[ctx.divdepth-1]++;
        const depthcount=ctx.depthcounts[ctx.divdepth-1];
        return '^z'+toBase26(ctx.divdepth-1)+depthcount+'【';
    },
    p:(el,ctx)=>{
        let weight=0;
        if ("head"===el.attrs.type) weight=4;
        return emitID(el,ctx,weight);
    },
    figure:(el,ctx)=>{
        ctx.breaklb=true;
        return emitID(el,ctx,3);
    },
    table:(el,ctx)=>{
        ctx.breaklb=true;
        return emitID(el,ctx,3);
    },
    seg:(el,ctx)=>{
        return emitID(el,ctx,2);
    },
    div:(el,ctx)=>{ //計算深度
        if (!ctx.divdepth) ctx.divdepth=0;
        ctx.divdepth++;
        return emitID(el,ctx,4);
    },
    q:(el,ctx)=>{
        if ('被解釋的經論'===el.attrs.type) {
            ctx.orig=true;
        }
    },
    ref:(el,ctx)=>{
        return el.attrs.text;
    },
    ptr:(el,ctx)=>{
        if (el.attrs['target']) { //pair with <note xml:id
            const m=el.attrs['target'].match(/(\d+)\.(\d+)/);
            if (m) {
                const fid=m[1]+toBase26(parseInt(m[2])-1);
                ctx.compact=true;
                return '^ptr'+fid;
            } else {
                console.log('invalid ptr',el)
            }
        }
    },
    note:(el,ctx)=>{
        let fid='';
        if (el.attrs['xml:id']) { //pair with <ptr            
            const m=el.attrs['xml:id'].match(/(\d+)\.(\d+)/);
            if (m) {
                fid=m[1]+toBase26(parseInt(m[2])-1);
            }
        }
        ctx.compact=true;
        return '^note'+fid;
    }
}
export const onClose={
    ref:(el,ctx)=>{
        //if has enclosed text, emit chinese bracket
        return ''
    },
    figure:(el,ctx)=>{
        ctx.breaklb=false;
    },
    head:(el,ctx)=>{
        // const insertofftag=(head2ck[ctx.filename]||{})[ctx.n]
        return '】'
    },
    _note:(el,ctx)=>{// with <ref> inside
        if (!ctx.notes[ctx.bk]) ctx.notes[ctx.bk]=[];
        let fid=ctx.notes[ctx.bk].length+1;
        ctx.compact=true;
        ctx.hide=false;
        ctx.notes[ctx.bk].push('^fn'+fid+' '+el.innerText());

        return '^f'+fid;
    },
    div:(el,ctx)=>{
        ctx.divdepth--;
    }
}
export const onText=(t,ctx)=>{
    if (ctx.compact && t.charCodeAt(0)<0x7f) { // a compact offtag is emitted just now
        t=' '+t;                               // use blank to separate tag ]
        ctx.compact=false;
    }
    t=t.replace(/\[([a-z\.]+)\d*_([^\]]+)\]+/g,(m,type,gid)=>{
        if (type=='mc') {
            return ctx.charmaps[gid]||'';
        }
        return '';
    })
    return ctx.hide?'':t;
}
