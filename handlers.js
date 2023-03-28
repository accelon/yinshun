import {p2otxt,head2ck} from './chunks.js'
export const onOpen={
    lb:(el,ctx)=>{
        if (el.attrs.type!=='old') {
            ctx.n=el.attrs.n;
        }
        if (ctx.breaklb) return '\n';
    },
    head:(el,ctx)=>{
        const insertofftag=(head2ck[ctx.filename]||{})[ctx.n]
        if (insertofftag) return insertofftag+'【';
        return '　　'
    },
    p:(el,ctx)=>{
        if (ctx.orig) {
            ctx.orig=false;
            const otxt=p2otxt[ctx.filename]||{};
            return '\n^o'+(otxt[ctx.n]?'@'+otxt[ctx.n]:'')+' '
        } else {
            return '\n◆'
        }
    },
    figure:(el,ctx)=>{
        ctx.breaklb=true;
    },
    div:(el,ctx)=>{
        //首個目錄節點換行
        const insertofftag=(head2ck[ctx.filename]||{})[ctx.n]
        if (insertofftag) return '\n';
    },
    q:(el,ctx)=>{
        if (el.attrs.type=='被解釋的經論') {
            ctx.orig=true;
        }
    }
}
export const onClose={
    figure:(el,ctx)=>{
        ctx.breaklb=false;
    },
    head:(el,ctx)=>{
        const insertofftag=(head2ck[ctx.filename]||{})[ctx.n]
        if (insertofftag) return '】'
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
