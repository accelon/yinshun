import { convall } from "./gen-base.js";

const from =1;
const count=1;
const files=['y26','y27'];
// for (var i=from;i<from+count;i++) {
//     files.push('y'+i.toString().padStart(2,'0'));
// }

const docontent=(content)=>{
    let err=0;
    return [err,content.split('\n')];
}
convall(files,docontent);