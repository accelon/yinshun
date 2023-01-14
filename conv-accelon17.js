/* convert accelon2017 to off format*/
import {unique,alphabetically,Offtext,cjkPhrases,
    removeBracket,alphabetically0, fromObj,
    nodefs,parseOfftext,readTextLines,  patchBuf,
    writeChanged, readTextContent, openInMemoryPtk} from 'ptk/nodebundle.cjs'

await nodefs;
import {hotfix} from './src/hotfix.js'
const a17folder='yinshun-corpus/' ;//github.com/yinshun/yinshun-corpus
const files=[];
const from=1;
const count=1;
for (var i=from;i<from+count;i++) {
    files.push('y'+i.toString().padStart(2,'0'));
}

const replaceChoice=(content)=>{ 
    return content.replace(/<choice[^<]*><orig>([^<]*)<\/orig><reg>([^<]*)<\/reg><\/choice>/g,
    (m,orig,reg)=>{
        return reg;
    }).replace(/<choice><sic>([^<]*)<\/sic><corr resp="([^<]+?)">([^<]*)<note[^<]*>([^<]+?)<\/note><\/corr><\/choice>/g,(m,sic,resp,corr,noteattr,note)=>{
        return corr;
    }).replace(/<choice><sic>([^<]*)<\/sic><corr resp="([^<]+?)">([^<]*)<\/corr><\/choice>/g,(m,sic,resp,corr)=>{
        return corr;
    }).replace(/<choice><sic>([^<]*)<\/sic><corr>([^<]*)<\/corr><\/choice>/g,(m,sic,corr)=>{
        return corr;
    }).replace(/<choice><corr>([^<]*)<\/corr><sic>([^<]*)<\/sic><\/choice>/g,(m,corr,sic)=>{
        return corr;
    })

}
const replaceBibl=(content)=>{
    return content.replace(/<bibl ?([^>]*)>(.+?)<\/bibl>/g,(m1,bibl,text)=>{
        
        return '^bibl'+text.replace(/<[>]+?>/g,'');
    });



    return content.replace(/<bibl>(.+?)<\/bibl>/g,(m1,bibl)=>{
        bibl=bibl.replace(/<biblScope type="([^<"]+)" n="([^<"]+)"><note[^<]*>(.+?)<\/note><\/biblScope>/g,(m,btype,bn,note)=>{
            return '('+bn+')';
        })
    })
    // .replace(/<bibl>([^<]*)<title level="([^<]+?)">([^<]+?)<\/title>([^<]*)<\/bibl>/g,(m1,e1,level,title,e2)=>{
    //     if (removeBracket(title)==title) title='《'+title+'》';
    //     return '^bibl['+e1+'^ti'+title+e2+']';
    // })
    .replace(/<title level="([^<]+?)">([^<]+?)<\/title>/g,(m,level,title)=>{
        if (removeBracket(title)==title) title='《'+title+'》';
        return '^ti'+title;
    })
}
const replaceHead=content=>{
    return content.replace(/<head><seg[^<]*>([^>]+?)<\/seg><\/head>/g,(m,t)=>{
        return '^seg【'+t+'】';
    }).replace(/<head>([^<]+?)<\/head>/g,(m,t)=>{
        return '^h【'+t+'】';
    }).replace(/<p type="head">(.+?)<\/p>/g,(m,t)=>{
        return '^h〔'+t+'〕';
    })
}
const replaceRef=content=>{
    return content.replace(/<ref type="([^<]+?)" target="([^<]+?)">([^<]+?)<\/ref>/g,(m,type,target,text)=>{
        return text;
    }).replace(/<ref type="([^<]+?)" target="([^<]+?)"\/>/g,'')
}
const replaceNote=content=>{
    return content.replace(/<note([^>]*)>([^<]*?)<\/note>/g,(m1,bibl)=>{
        return '^note';
    });
}
const replaceTitle=content=>{
    return content.replace(/<title([^>]*)>([^<]+)<\/title>/g,(m1,attr,text)=>{
        if (removeBracket(text)==text)  text='《'+text+'》'
        return '^title'+text;
    });
}
const replaceTable=content=>{
    return content.replace(/<table([^>]*)>(.+?)<\/table>/g,(m1,bibl)=>{
        return '^table';
    }).replace(/<figure([^>]*)>(.+?)<\/figure>/g,(m1,bibl)=>{
        return '^figure'
    }).replace(/<graphic([^>]+)\/>/g,(m1,bibl)=>{
    return '^graphic'
})
}
const replaceForeign=content=>{
    return content.replace(/<foreign xml:lang="([^<]+)">([^<]+?)<\/foreign>/g,(m1,lang,t)=>{
        if (~lang.indexOf('-')) {
            lang=lang.replace(/[^a-z]/g,'');
        }
        return '^'+lang+'('+t+')';
    }).replace(/<foreign>([^>]+)<\/foreign>/g,'') ;// <foreign>Bewt</foreign>
}
const replaceQuote=content=>{
    return content.replace(/<q ?([^>]*)>([^<]+?)<\/q>/g,(m1,type,text)=>{
        return '^q'+text;
    });
}
const replaceCit=(content)=>{
    // content=content.replace(/<q type="被解釋的經論">(.+?)<\/q>/g,(m,m1)=>{
    //     return '\n^src〔'+m1.replace(/※/g,'')+'〕';
    // })
    
    content=content.replace(/<cit>(.+?)<\/cit>/g,(m,m1)=>{
        return '^cit';
    })
    /*
    replace(/<cit><bibl><title level="([^<]+?)">([^<]+?)<\/title>([^<]*)<\/bibl><q type="([^<]+?)">([^<]+?)<\/q><note[^<]*>([^<]+?)<\/note><\/cit>/g,
    (m,titlelevel, title, extra, qtype, qtext, noteattr, note)=>{
        let qt='';
        if (qtype=='寬鬆引文') qt='l';
        return '^ti《'+removeBracket(title)+'》'+extra+'^q'+qt+qtext;
    }).replace(/<cit><bibl><title level="([^<]+?)">([^<]+?)<\/title>([^<]*?)<\/bibl><q type="([^<]+?)">([^<]+?)<\/q><\/cit>/g,
    (m,titlelevel, title, extra, qtype, qtext)=>{
        let qt='';
        if (qtype=='寬鬆引文') qt='l';
        return '^ti《'+removeBracket(title)+'》'+extra+'^q'+qt+qtext;
    })
    
    .replace(/<q type="([^<]+?)">([^<]+?)<note[^<]*>(.+?)<\/note><\/q>/g,(m,qtype,qtext,noteattr,note)=>{
        let qt='';
        if (qtype=='寬鬆引文') qt='l';
        return '^q'+qt+qtext;
    })

    .replace(/<q type="([^<]+?)">([^<]+?)<\/q>/g,(m,qtype,qtext)=>{
        let qt='';
        if (qtype=='寬鬆') qt='l';
        return '^q'+qt+qtext;
    })    
    .replace(/<q>([^<]+?)<\/q>/g,(m,qtype,qtext)=>{
        return '^q'+qtext;
    })
    */      
    return content
}


const addChunk=(content)=>{
    let chunkcount=0;
    while (content.match(/\n\^h([【〔].+)\n\^h([【〔])/)) {
        content=content.replace(/\n\^h([【〔].+)\n\^h([【〔])/,'\n^h$1^h$2') ;
    }
    content=content.replace(/\n\^h([【〔])/g,(m,m1)=>{
        chunkcount++;
        return '\n^ck'+chunkcount+'^h'+m1;
    })
    return content;
}
const conv=(filename,content,test)=>{
    const from=content.indexOf('<body>');
    const to=content.indexOf('</body>');
    if (from>-1 && to >-1) content=content.slice(from+6,to);
    content=content.replace(/\n/g,'');

    content=content.replace(/<p>/g,"※") // q might include <p>, 被解釋的經論
    .replace(/<\/p>/g,"") 
    .replace(/<label>([^<]+?)<\/label>/g,"^label【$1】") 
    .replace(/<seg([^>]*)>([^<]+?)<\/seg>/g,"^seg〔$2〕") 
    .replace(/<ptr([^<]+?)\/>/g,"^ptr") 
    .replace(/<persName([^<]+?)>([^<]+?)<\/persName>/g,"$2") 
    .replace(/<list>/g,'').replace(/<\/list>/g,'')

    content=content
    .replace(/<lg[^<]*>/g,'').replace(/<\/lg>/g,'')
    .replace(/<l>/g,'').replace(/<\/l>/g,'')
    
    content=replaceRef(content);
    content=replaceNote(content);
    content=replaceForeign(content); //先把純 foreign 替換
    content=replaceQuote(content);
    content=replaceTitle(content);  //先把純 Title 替換
    content=replaceBibl(content);

    content=replaceChoice(content); //cit might consist choice

    content=replaceBibl(content);
    content=replaceCit(content);
    content=replaceHead(content);
    
    content=replaceTitle(content);  //choice 裡頭包title
    content=replaceQuote(content);
    content=replaceForeign(content);  //choice 裡頭包 Foreign

    content=replaceTable(content);
    content=replaceRef(content);
    content=replaceNote(content);
    content=replaceQuote(content);


    const bkid=filename.slice(1);

    content=content.replace(/<p ([^>]+)>/g,"※") 
    .replace(/※/g,'\n')
    .replace(/<\/?listBibl>/g,'')
    .replace(/<div ?([^>]*)>/g,"\n")
    .replace(/<\/div>/g,"")
    .replace(/<item/g,"\n<item")
    .replace(/<byline[^<]*>([^<]+?)<\/byline>/,'\n$1')
    .replace(/<articlegroup[^<]*?label="([^<;]+);([^<]+)"\/>/,'^ak'+bkid+'【$1】^bk'+bkid+'【$2】')
    .replace(/<opener>(.+?)<\/opener>/,'')   
    .replace(/<g [^>]+\/>/g,"") 
    .replace(/<num [^>]+>[^<]+<\/num>/g,"") 
    .replace(/<item[^<]*>([^<]+)<\/item>/g,"^i【$1】") 

    content=addChunk(content);

    if (test) {
        const lines=content.split('\n');
        for (let i=0;i<lines.length;i++) {
            if (~lines[i].indexOf('<')) {
                console.log('not clean',i)
            }
        }
    } 
    //kill all tag
    content=content.replace(/<[^>]+>/g,'')
    writeChanged('off/'+filename+'.off',content,true)
}


const convall=()=>{
files.forEach(filename=>{
    let content=readTextContent(a17folder+'/xml/'+filename+'.xml')
    const errata=hotfix[filename];
    if (errata) {
        console.log('patching',filename)
        content=patchBuf(content,errata,filename)
    }

    content=content.replace(/<pb n="(\d+)"\/>/g,"^pb$1")
    .replace(/<pb n="([ab])(\d+)"\/>/g,"^pb$2$1")
    .replace(/<lb[ \n]+n=([^<]+?)\/>/g,(m,m1)=>{ //some tag has multiple space 
        return '^lb ';
    }).replace(/\^lb[^a-zA-Z_\-]/g,'\t')//tab as lb
    .replace(/(\^pb\d+)\t/g,'$1');
    
    conv(filename,content);
    
})
}
// conv('test-content',readTextContent('test-content.xml'),true);

convall();
