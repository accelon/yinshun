import { convall } from "./gen-base.js";
const from =1;
const count=1;
const files=[];
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}

const docontent=(content)=>{
    let err=0;
    const lines=content.split(/\r?\n/).map(line=>{
        if (line.charAt(0)=='◆') {
            return breakChineseSentence(line)
        }
        return line;
    }).filter(it=>!!it);
    return [err,lines];
}


convall(files,docontent);