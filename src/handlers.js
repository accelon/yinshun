// import {p2otxt,head2ck} from './chunks.js'
import {meta_cbeta,toBase26} from 'ptk/nodebundle.cjs'

const makeChunkId=(ctx)=>{
    const m=ctx.n.match(/(\d+)\.(\d+)/);
    const id=parseInt(m[1])+toBase26(parseInt(m[2])-1);
    if (ctx.previd==id) return '';

    if (!ctx.idcount) ctx.idcount=0;
    ctx.idcount++;
    ctx.previd=id;
    return id+' ';
}
const emitID=(el,ctx)=>{
    const id=makeChunkId(ctx);
    const emit=id?'\n^ck'+id:'\n';
    if (emit) {
        if (!ctx.prevlbcount) ctx.prevlbcount=0;
        const dist=ctx.lbcount-ctx.prevlbcount;
        ctx.distances.push([ctx.milestone+id, dist ]);
        ctx.prevlbcount=ctx.lbcount;
    }
    return emit;
}
export const onOpen={
    milestone:(el,ctx)=>{ //2023.4.11 之後新增 到 github.com/yinshun/yinshun-corpus
        // console.log(el.attrs.id);
        ctx.milestone=el.attrs.id;
        return '^bk#'+ctx.milestone+'【'+el.attrs.title+'】';
    },
    lb:(el,ctx)=>{
        if (!ctx.lbcount) ctx.lbcount=0;
        ctx.lbcount++;
        if (el.attrs.type!=='old') { //cbeta 有新舊兩版頁碼。 yinshun-corpus 只有舊版頁碼
            ctx.n=el.attrs.n;
        }
        if (ctx.breaklb) return '\n';
    },
    head:(el,ctx)=>{
        // const insertofftag=(head2ck[ctx.filename]||{})[ctx.n]
        // if (insertofftag) return insertofftag+'【';
        // return '　　'
    },
    p:(el,ctx)=>{
        return emitID(el,ctx);
    },
    figure:(el,ctx)=>{
        ctx.breaklb=true;
        return emitID(el,ctx);
    },
    table:(el,ctx)=>{
        ctx.breaklb=true;
        return emitID(el,ctx);
    },
    seg:(el,ctx)=>{
        return emitID(el,ctx);
    },
    div:(el,ctx)=>{ //計算深度
        return emitID(el,ctx);
    },
    q:(el,ctx)=>{
        if (el.attrs.type=='被解釋的經論') {
            ctx.orig=true;
        }
    },
    ref:(el,ctx)=>{
        return el.attrs.text;
    },
    _note:(el,ctx)=>{
        ctx.hide=true;
        return ''
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
        // if (insertofftag) return '】'
    },
    _note:(el,ctx)=>{// with <ref> inside
        if (!ctx.notes) ctx.notes={};
        if (!ctx.notes[ctx.milestone]) ctx.notes[ctx.milestone]=[];
        const fid=ctx.notes[ctx.milestone].length;
        ctx.notes[ctx.milestone].push('^fn'+fid+' '+el.innerText());
        ctx.hide=false;
        return '^f'+fid;
    }
}
export const onText=(t,ctx)=>{
    t=t.replace(/\[([a-z\.]+)\d*_([^\]]+)\]+/g,(m,type,gid)=>{
        if (type=='mc') {
            return ctx.charmaps[gid]||'';
        }
        return '';
    })
    return ctx.hide?'':t;
}
