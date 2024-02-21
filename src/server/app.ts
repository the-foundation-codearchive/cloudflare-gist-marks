import { fetchOGP, OGP } from './ogp'
import { isURL, makeKey } from '../util'
import { Link, ListResult } from '../types'
import { Context } from 'hono'
import { userAgentList } from '../ua.ts'


//declare let GHPAT: string
//declare let GIST: string
//declare let BOOKMARK: KVNamespace
const PREFIX: string = 'v1:gmlnk:'
const OGP_PREFIX: string = 'v1:gmogp:'
const DEBUGME: boolean = true
const DEBUGMEHARDER: boolean = true
const CONFIGFILE: string = "GistMarksCloud-settings.json"
const ALLOWEDUSERS: string = '[]'
const USERSTRING: string = "another user"
const IMAGEFALLB: string = "https://busy-shrimp-36.deno.dev?url="
const IMAGEPROXY: string = "https://1.m4g3c4ch3.workers.dev/c?url="

const github_gist_get_json_auth_sync = async (context: FetchEvent,pat: string,gist: string): Promise<Object> => {
  try {
  const filelistinit = {
    method: "GET",
    headers: {
      "Accept": "application/vnd.github+json",
      "content-type": "application/json;charset=UTF-8",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GistMarksCloud/0.1 Firefox/666",
      "Authorization": "Bearer "+pat,
    },
  };
    //async_error_handler(context,JSON.stringify(filelistinit))
    const gisturl= "https://api.github.com/gists/"+gist
    async_error_handler(context,"get gist json ")
    const firstresponse = await fetch(await gisturl, await filelistinit);
    let result=await firstresponse.status
    async_error_handler(context,"got_"+result+" getting gist json")
    if(!(await firstresponse.status==200) || (await firstresponse.status==201)) {
        async_error_handler(context,await firstresponse.text())
        return false
    } else {
        //let gistresp=await response.text()
        //let main_gistJSON = JSON.parse(gistresp.replace(/^\[/, "").replace(/\]$/, ""))
        //var main_gistJSON = eval("(function(){return " + data + ";})()");
        //async_error_handler(context,objJSON.result);​
       ///const { value: bodyIntArray } = await response.body.getReader().read()
       ///const bodyJSON = new TextDecoder().decode(bodyIntArray)
       ///async_error_handler(context,bodyJSON)
       ///const main_gistJSON=JSON.parse(bodyJSON)
       //console.log("getjson")
       //console.log(await JSON.stringify(await firstresponse))
       let  gistJSON   = await firstresponse.json()
       //console.log(main_gistJSON)
       return gistJSON
     }
    } catch(e) { console.log(e);return false}
}

const github_gist_update_description = async (context: FetchEvent,pat: string,gist: string,newdesc:string ): Promise<string> => {
  try {
    (DEBUGME) && async_error_handler(context,"updating gist desciption to "+await newdesc)
    let descelem={}
    descelem["description"]=await newdesc
    const descinit = {
      body: JSON.stringify(descelem),
      method: "PATCH",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GistMarksCloud/0.1 Firefox/666",
        "Authorization": "Bearer "+pat,
      },
    };

    //async_error_handler(context,JSON.stringify(descinit))
    //await console.log(descinit)
    const descurl= "https://api.github.com/gists/"+gist
    async_error_handler(context,"sending desc to "+ descurl)
    // (DEBUGMEHARDER) && async_error_handler(context,descinit)
    const response = await fetch(descurl, descinit);
    let result=await response.status;
    async_error_handler(context,"got_"+result+" update description")
    if((await response.status!=200)&& (await response.status!=201)) {
        let resptxt=await response.text()
        async_error_handler(context,"failed setting description ")
        async_error_handler(context,resptxt)
        return JSON.stringify({ status:"err",msg: "failed: "+resptxt })
    } else {
     // (DEBUGMEHARDER) && async_error_handler(context,await response.text())
    return JSON.stringify({ status:"ok",msg: "updated description"})
    }
  } catch (e) {
    (DEBUGME) && async_error_handler(context,{ status:"err",msg: "failed_outer: "+e})
         return JSON.stringify({ status:"err",msg: "failed_outer: "+e})
  }
}
const github_gist_file_create_and_cache = async (context: FetchEvent,ghpat: string,gist: string,ghusr: string,filename:string ,content: string,namespace: KVNamespace): Promise<string> => {
  
  //let mycache = caches.default;
  await github_gist_file_create(context,ghpat,gist,filename,content)
  const cacheinit = {
    method: "GET",
    headers: {
      "Accept": "application/vnd.github+json",
      "content-type": "application/json;charset=UTF-8",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GistMarksCloud/0.1 Firefox/666",
      //"Authorization": "Bearer "+pat,
    },
  };
  //async_error_handler(context,JSON.stringify(fileinit))
  const cachefileurl= "https://gist.githubusercontent.com/"+ghusr+"/"+gist+"/raw/"+filename
  const cacheconfresp=fetch(cachefileurl,cacheinit)
  // Must use Response constructor to inherit all of response's fields
  let response = new Response(cacheconfresp.body, cacheconfresp);
  
  // Cache API respects Cache-Control headers. Setting s-max-age to 10
  // will limit the response to be in cache for 10 seconds max
  // Any changes made to the response here will be reflected in the cached value
  response.headers.append("Cache-Control", "s-maxage=3600");
  console.log("caching "+cachefileurl.tostring())
//  await env.CACHE.put("KEY", "VALUE")
//  const value = await env.YOUR_KV_NAMESPACE.get("KEY");        
//  if (value === null) {            
//    return new Response("Value not found", { status: 404 });        
//    }       
try {
     context.waitUntil(await console.log(await JSON.stringify((await mycache.put(await cachefileurl.toString(), response.clone())))));
} catch (ea) {
    console.log("error storing to native cache"+ea)
}
try {
  context.waitUntil(await console.log(await JSON.stringify((await namespace.put(btoa(await cachefileurl.toString()), await btoa(content))))));
} catch (eb) {
 console.log("¹ error storing to kv cache"+eb)
}
}
const github_gist_file_create = async (context: FetchEvent,pat: string,gist: string,filename:string ,content: string): Promise<string> => {
  try {
    //let cmstring=JSON.stringify(ogp, null, 2); 
    (DEBUGME) && async_error_handler(context,"new gist file "+filename)
    let filetmp={}
    filetmp[filename]={content}

    const fileinit = {
      //body: '{"body":"This is a comment to a gist at'+localDate+'"}',
      //body: '{"body":"add|'+localDate+'|'+btoa(JSON.stringify(ogp))+'"}',
      body: JSON.stringify({files: filetmp}),
      method: "PATCH",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GistMarksCloud/0.1 Firefox/666",
        "Authorization": "Bearer "+pat,
      },
    };
    //async_error_handler(context,JSON.stringify(fileinit))
    const fileurl= "https://api.github.com/gists/"+gist
    async_error_handler(context,"saving "+filename+" to "+ fileurl)
    // (DEBUGMEHARDER) && async_error_handler(context,fileinit)

    const response = await fetch(fileurl, fileinit);
    let result=await response.status;
    async_error_handler(context,"got_"+result)
    if((await response.status!=200)&& (await response.status!=201)) {
        let resptxt=await response.text()
        async_error_handler(context,"failed creating "+filename)
        async_error_handler(context,resptxt)
        return JSON.stringify({ status:"err",msg: "failed: "+resptxt })
    } else {
     // (DEBUGMEHARDER) && async_error_handler(context,await response.text())
    return JSON.stringify({ status:"ok",msg: "created: "+filename})
    }
  } catch (e) {
    (DEBUGME) && async_error_handler(context,{ status:"err",msg: "failed_outer: "+e})
         return JSON.stringify({ status:"err",msg: "failed_outer: "+e})
  }
}


const github_gist_create = async (context: FetchEvent,pat: string,gistdescription:string ,readmecontents: string): Promise<string> => {
  try {
    //let cmstring=JSON.stringify(ogp, null, 2); 
    (DEBUGME) && async_error_handler(context,"new gist ")
    let filetmp={}
    filetmp["README.md"]={content: readmecontents}

    const fileinit = {
      //body: '{"body":"This is a comment to a gist at'+localDate+'"}',
      //body: '{"body":"add|'+localDate+'|'+btoa(JSON.stringify(ogp))+'"}',
      body: JSON.stringify({files: filetmp,description: await gistdescription}),
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GistMarksCloud/0.1 Firefox/666",
        "Authorization": "Bearer "+pat,
      },
    };
    //async_error_handler(context,JSON.stringify(fileinit))
    //console.log("new_gist")
    let createurl= "https://api.github.com/gists"
    //console.log("new_gist_")
    //async_error_handler(context,"creating by "+ fileurl)
    // (DEBUGMEHARDER) && async_error_handler(context,fileinit)
    //console.log("new_gist2")
    const cresponse = await fetch(createurl, fileinit);
    //console.log("new_gist3")
    let result=await cresponse.status;
    //console.log("new_gist4")
    async_error_handler(context,"got_"+result)
    //console.log(cresponse.text())
    if((await cresponse.status!=200)&& (await cresponse.status!=201)) {
        let resptxt=await cresponse.text()
        console.log("failed creating gist - msg: "+resptxt)
        async_error_handler(context,"failed creating gist - msg:"+resptxt)
        async_error_handler(context,resptxt)
        return { status:"err",msg: "failed: "+resptxt }
    } else {
     // (DEBUGMEHARDER) && async_error_handler(context,await response.text())
     const createresp=await cresponse.json()
     if(("commits_url" in  createresp )&&("id" in createresp)) {
        return { status:"ok",url: createresp.url,msg: "created: "+createresp.id}
     } else {
        let resptxt=await response.text()
        return{ status:"err",msg: "failed: "+resptxt }
     }
    }
  } catch (e) {
    (DEBUGME) && async_error_handler(context,{ status:"err",msg: "failed_outer_creategist: "+e})
         return { status:"err",msg: "failed_outer_creategist: "+e}
  }
}

const isJSON = async (str: string | ""): Promise<boolean> => {
  try {
      return (JSON.parse(str) && !!str);
  } catch (e) {
      return false;
  }
}


//const isJSON = async (str: string | ""): Promise<boolean> => {
//  try {
//      return (JSON.parse(str) && !!str);
//  } catch (e) {
//      return false;
//  }
//}

const status_msg_create = async (userstr: string | "",suffix: string | ""): Promise<string> => {
  return "GistMarks Bookmarks of "+userstr+"|"+suffix;
}

const isLinkinStore = async (link: String,store: Array | ""): Promise<boolean> => {
  try {
      if(arr.find(o => o.url === link)) { 
        return true 
      } else { 
        return false }
  } catch (e) {
      return false;
  }
}

const getStoreWithoutLink = async (link: String,store: Array | ""): Promise<Array> => {
  try {
      return store.filter(function( obj ) {
        return obj.url !== link;
     });
  } catch (e) {
    error_handler("failed to filter element, returning store")
      return store;
  }
}

const async_error_handler = async (context: FetchEvent, msg: string | ""): Promise<boolean> => {

  if (typeof msg === 'string' || msg instanceof String) {
    context.waitUntil(await console.log(await msg));
  } else { 
    if(isJSON(await msg)) {
      context.waitUntil(await console.log(JSON.stringify(JSON.parse(await msg), null, 2)));
    } else {
      try {
        await console.log(JSON.stringify(await msg, null, 2))
      } catch(e) {
        context.waitUntil(await console.log(await msg));

      }
    }
    }
  
}

const getLinks = async (cursor: string | undefined,category: string | "all" , limit: number = 20,context: FetchEvent, namespace: KVNamespace): Promise<ListResult> => {
  const CFcache = caches.default;
  let ownerurl="GISTMARKS_USER_NOT_SET"
  let localDate = Date.now();  // will return actual current date
  var changes={ count: 0, del: 0 , add: 0,upd: 0, delurls_comment: [  ] }
  let lock_sent=false
  const myuseragent=userAgentList[userAgentList.length * Math.random() | 0]
  
  //const list = await BOOKMARK.list<Link>({ prefix: PREFIX, limit: limit, cursor: cursor })
  //const list={ arr }
  //const keys = list.keys
  //const links = keys
  //  .map((value) => value.metadata)
  //  .filter((link): link is Link => link != undefined)
  //return { links: links, cursor: list.cursor, complete: list.list_complete }
  //async_error_handler("getlinks")
  try {
      console.log("getlinks")
       let myconfig={}
       // first check cache for config
       const confcacheurl= "https://gist.githubusercontent.com/"+GHUSR+"/"+GIST+"/raw/"+CONFIGFILE
       let cachedconfig=false
       let cachesource="NONE"
       let configfound=false
       
       let confcacheresponse = await CFcache.match(confcacheurl.toString());
        if (!confcacheresponse) { console.log('url: '+confcacheurl+' not present in cache')
       } else {
        console.log("config native_cached:");cachedconfig=true;configfound=true;cachesource="native"
        let myrestxt=await confcacheresponse.text();myconfig=JSON.parse(myrestxt)
        //console.log(myrestxt)
       }
       //if(!configfound) {
       //try {
       // const confkvresponse = await namespace.get(btoa(confcacheurl.toString()));        
       // if (confkvresponse === null || confkvresponse === undefined) {            
       //   console.log('url: '+confcacheurl+' not present in kv')          
       //   }   else {
       //    cachesource="kv";           cachedconfig=true
       //    console.log('url: '+confcacheurl+' CACHED FROM kv')
       //    //console.log(atob(confkvresponse))
       //    myconfig=JSON.parse(atob(confkvresponse))
       //   }
       //} catch(e) { console.log("failed on KV:"+e)}
       //}
      let mainsource={}
      let main_gistJSON={}
      //only fetch main file here if we really need it 
     // console.log("fetchornot")
     // console.log(myconfig)
      if( (!(typeof myconfig === 'object') &&      Array.isArray(myconfig) &&      myconfig === null) ||  ( !("owner" in myconfig) || !("storageloc" in myconfig) ) ) {
          //console.log("fetch")

           mainsource=await github_gist_get_json_auth_sync(context,GHPAT,GIST)
           myconfig=JSON.parse(await mainsource.files[CONFIGFILE].content)
           //console.log(myconfig)
           main_gistJSON=mainsource
           mainsource={}
          }
      if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ( ("owner" in myconfig) && ("storageloc" in myconfig))){ 
        configfound=true
      }
      console.log("before setup")
      if(typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ( !("owner" in myconfig) || !("storageloc" in myconfig) ) ) {
        //even after fetching , we do not have a config
        //( maybe setup did not run ... ) 
        console.log("booting..setup default config")
        const initrdmstr = '' +
        '# Bookmarks [Storage](https://github.com/thefoundation/cloudflare-gist-marks) <br>' +
        'Hi , here we just store our content for [the real gist](https://gist.github.com/'+GHUSR+"/"+GIST+') '+
        '<hr>'+
        '	<span> Gist-Marks powered by:<b>❤ unicorns &amp;	</b></span>'+
        '	' +
        '<a href="https://the-foundation.gitlab.io/"><div><img src="https://is.gd/gistmarkslogov1" width="240" height="135"/></div></a>'+
        '';
        let storage_init=await github_gist_create(context,GHPAT,"gistmark-storage for "+GIST,initrdmstr)
        console.log(storage_init)
        if(("status" in storage_init)&&(storage_init.status=="ok")) {
          console.log("saving default config")
          const mystorageloc=storage_init.url
          const newconfig={ storageloc: mystorageloc , time: localDate , owner: 'https://api.github.com/users/'+GHUSR }
          ownerurl='https://api.github.com/users/'+GHUSR
          context.waitUntil( await github_gist_file_create_and_cache(context,GHPAT,GIST,GHUSR,CONFIGFILE,JSON.stringify(newconfig,null," "),namespace) );
          myconfig=newconfig
          //if(typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && !("storageloc" in myconfig) ) {
          //  mainsource=await github_gist_get_json_auth_sync(context,GHPAT,GIST)
          //  myconfig=JSON.parse(await mainsource.files[CONFIGFILE].content)
          //  main_gistJSON=mainsource
          //  mainsource={}
          // }
        } else {
          async_error_handler(context,"FAILED SETTING UP STORAGE")
          //const failelem={ "FAILED SETTING UP STORAGE" ,true}
          //return failelem
          return false
        }
        if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && !("storageloc" in myconfig)){
        console.log("could not get storageloc from gist json even after creating" )
        console.log(mainsource)
        return false;
        }

          //return "hello string"
        } //end setup or error
        console.log("getting owner")
        if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ("owner" in myconfig)){
          ownerurl=myconfig.owner
        }

        //console.log(configfound)
        //console.log(myconfig)
        //console.log(ownerurl) // GISTMARKS_USER_NOT_SET
        if(ownerurl=="GISTMARKS_USER_NOT_SET") {
          console.log("NO OWNER FOUND")
          return false;
        }
        if(!configfound) {
          console.log( "at this point we NEED a config")
          return false;
        } 
        // -----------------  start processing
        if(!cachedconfig) { console.log("config_from_gist") }
        mainsource={}
        let mystorage=""
        let mystorageid=""
        let stor_gistJSON={}
        let categofound=false
        let bookjsfound=false
        let truncated=[]
        let readmefound=false
        let nondefault_store=[]

        if( !("owner" in myconfig) || !("storageloc" in myconfig)) {
          console.log("NEED STORAGELOC AND OWNER")
          console.log(myconfig)
          return false;
         } else {
          configfound=true
          console.log("foundconfig")
          console.log(JSON.stringify(myconfig.storageloc))
          mystorage=myconfig.storageloc
          //console.log(mystorage)
          mystorageid=await mystorage.split("/").pop();
         }

        //async_error_handler(context,main_gistJSON)
        //const files=main_gistJSON.files
        
        //const ownerurl=main_gistJSON.owner.url
        //let mainstorage="notfound"

        //console.log(ownerurl);async_error_handler(context,"owner "+ownerurl)
        let bookstore_empty={ version: 0, date: localDate,
          bookmarks: [ ] }
        let bookstore_default={ version: 0, date: localDate,
            bookmarks: [
             {"url":"https://github.com/thefoundation/cloudflare-gist-marks","cat":"default","title":"Gistmarks Home","description":"","key": await makeKey("https://github.com/thefoundation/cloudflare-gist-marks")},
             {"url":"https://github.com","cat":"default","title":"GITHUB.com , a great place to code","description":"","key": await makeKey("https://github.com")}
            ] }
           //console.log("after storage detection:"+JSON.stringify(mystorage))

           //start over
           const gisturl= "https://api.github.com/gists/"+mystorageid

           const filelistinit = {
            method: "GET",
            headers: {
              "Accept": "application/vnd.github+json",
              "content-type": "application/json;charset=UTF-8",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": myuseragent,
              //"Authorization": "Bearer "+GHPAT,
            },
          };
          async_error_handler(context,"1. get db")
          const storgistresponse = await fetch(gisturl, filelistinit);
          let result=await storgistresponse.status
          async_error_handler(context,"got_"+result)
          if(!(await storgistresponse.status==200) || (await storgistresponse.status==201)) {
              async_error_handler(context,await storgistresponse.text())
              return false
          } else {
            console.log("2 got gist")
              //let maingistresp=await response.text()
              //let main_gistJSON = JSON.parse(gistresp.replace(/^\[/, "").replace(/\]$/, ""))
              //var main_gistJSON = eval("(function(){return " + data + ";})()");
              //async_error_handler(context,objJSON.result);​
             ///const { value: bodyIntArray } = await response.body.getReader().read()
             ///const bodyJSON = new TextDecoder().decode(bodyIntArray)
             ///async_error_handler(context,bodyJSON)
             ///const main_gistJSON=JSON.parse(bodyJSON)
             stor_gistJSON   = await storgistresponse.json()
          }

          if('files' in stor_gistJSON) {
            console.log("scan files 2(stor)")
            let scanfiles=Object.keys(stor_gistJSON.files)
            //Object.keys(stor_gistJSON.files).forEach(filename => {
            for (const filename of scanfiles) {
              //async_error_handler(context,filename)
              //async_error_handler(context,stor_gistJSON.files[filename])
              //if(filename=="README.md")                     { readmefound=true         }
              if(filename=="bookmarks.json")                { bookjsfound=true         }
              //if(filename=="GistMarksCloud-category.json")  { categofound=true         }
              //if(filename==CONFIGFILE)                      { configfound=true         }
              if(stor_gistJSON.files[filename].truncated==true)  { truncated.push(filename) }
           }
           // });
          } else { console.log("no files in storjson"); }
          console.log("done file_scan 2")
          if("content" in stor_gistJSON.files["bookmarks.json"]) {
            bookstore_default=JSON.parse(stor_gistJSON.files["bookmarks.json"].content)
          }
          if('comments' in stor_gistJSON && stor_gistJSON.comments !=0 ) { 
               
            let allowusers=[]
            try {
                let tmpallowusers=await JSON.parse(ALLOWEDUSERS)
                for (const userurl of tmpallowusers) {
                 if(userurl.includes("https://github.com")) { allowusers.push(userurl) }
                }
                allowusers.push(ownerurl)
                console.log("ALLOWusers_parsed: "+JSON.stringify(allowusers))
               } catch(e) {
               allowusers=[ownerurl];async_error_handler(context,"err: allow users not parseable: "+e)
             }

             async_error_handler(context,stor_gistJSON.comments+" comments found(total)")
             // uncommitted bookmarks ( and potential comment from other users since we cannot prohibit commenting on secret gists )
             const commenturl= "https://api.github.com/gists/"+mystorageid+"/comments?per_page=100"
             async_error_handler(context,"listing files from"+commenturl)
             const commentinit = {
              cf: {   cacheTtl: 0,  cacheEverything: false },
              method: "GET",
              headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                //"User-Agent": "GistMarksCloud/0.1 Firefox/666",
                "User-Agent": myuseragent,
                //"Authorization": "Bearer "+GHPAT,
               },
              };
            const commentresponse = await fetch(commenturl, commentinit);
            let need_push_=false
            let result=await commentresponse.status;
            async_error_handler(context,"got_"+result)
            if((result!=200)&& (result!=201)) {
              async_error_handler(context,"error_fetching_comments")
              async_error_handler(context,await(commentresponse.text()).message)
            } else { 
              // got first comments page 
              try {
                 let commentsJSON=await commentresponse.json()
                 //console.log(commentsJSON)
                 let elmcount=0
                  //commentsJSON.forEach( async element => {
                    for (let element of await commentsJSON) {
                    elmcount=elmcount+1
                    let commentowner=element.user.url
                    //async_error_handler(context,element)
                    if("body" in element) {
                      async_error_handler(context,"ACL_check "+commentowner + " IN " + JSON.stringify(allowusers));
                      if(allowusers.includes(commentowner)) {
                        console.log("userOK")
                      try {

                        if(isJSON(element.body)&& Array.isArray(JSON.parse(element.body)) ) {
                          console.log(element.body)
                         const parsedElem=JSON.parse(element.body)
                         console.log(parsedElem)
                         for (const commentbody of parsedElem) {
                          console.log(commentbody)
                          //let commentbody=JSON.parse(element.body)
                          async_error_handler(context,"2.1 found_json_comment_body")
                          if("action" in commentbody && (["add","del","upd"].includes(commentbody.action))) {
                            async_error_handler(context,"action json found")
                            if("url" in commentbody) {
                                async_error_handler(context,"2.2 valid_url_found");
                                changes.count++
                                if(commentbody.action=="add") { changes.add++ }
                                if(commentbody.action=="del") { changes.del++ }
                                if(commentbody.action=="upd") { changes.upd++ }
                                if(lock_sent==false) {
                                  async_error_handler(context,"2.2 sending_lock");
                                  context.waitUntil( await github_gist_update_description(context,GHPAT,mystorageid,status_msg_create(USERSTRING,localDate+"|UPDATING")) );
                                  lock_sent=true
                                }
                                //if(!Array.isArray(allowusers)) {
                                //  async_error_handler(context,"allow users found but no array")
                                //  allowusers=[ownerurl]
                                //}
                                //console.log(allowusers)
                                console.log("processing .."+elmcount+" -> "+commentbody.action)
                                if("cat" in commentbody) {
                                  async_error_handler(context,"2.3 found cat");
                                } else {
                                  commentbody.cat="default"
                                  async_error_handler(context,"2.4 using default cat");
                                }
                                if("ts" in commentbody) {            async_error_handler(context,"2.5         found ts");
                                } else {   commentbody.ts=localDate; async_error_handler(context,"2.5 using default ts");
                                }                               
                                
                                if(commentbody.cat=="default") {
                                  async_error_handler(context,"2.6 adding elem | default |");
                                  let strippedlist=await getStoreWithoutLink(commentbody.url,bookstore_default.bookmarks)
                                  //async_error_handler("deflen: "+bookstore_default.bookmarks.length)
                                  //async_error_handler("strippedlen: "+strippedlist.length)
                                  if((strippedlist.length) < bookstore_default.bookmarks.length) {
                                      // the element was already bookmarked
                                      async_error_handler(context,"2.6 pop_and_push [ "+strippedlist.length+"/"+bookstore_default.bookmarks.length+" ]")
                                      let newlist=strippedlist
                                      await newlist.push(commentbody)
                                      bookstore_default.bookmarks=newlist
                                     } else {
                                      async_error_handler(context,"2.6 only_push")
                                      await bookstore_default.bookmarks.push(commentbody)
                                     }
                                 let delcount=changes.delurls_comment.length
                                 changes.delurls_comment.push(element.url)
                                 console.log("pushed to elem _>before"+delcount+" after:"+changes.delurls_comment.length)
                                } else {
                                  async_error_handler(context,"2.6 adding element |"+commentbody.cat);
                                    //nondefault_store.push( {  }) 
                                }
                                async_error_handler(context,"2.7 bookmarks added");
                            } // end url in parsed json
                          } 
                         }
                        } else {
                          async_error_handler(context,"comment body found but no json")
                          console.log(commentbody)
                        }
                      } catch (bodyerr) {
                         async_error_handler(context,"error_processing_body of comment "+elmcount + " :"+bodyerr)
                      }
                      } else {
                        async_error_handler(context,"2.7 user "+commentowner+" not allowed");
                      } // end if/else commentowner in json
                    } // end body in element
                 //}); // end foreach 
                } // end for 
           
                 //console.log(changes)
              } catch (err) {
                 async_error_handler(context,'error_parsing_comments' + err)
            }
           } // end link fetch ok status
          //await async_error_handler(context,"2.8 done processing..will delete "+ await delcnt + " comments on submit");
          if((changes.delurls_comment.length!=0) && (changes.count!=0)) {
            await async_error_handler(context,"2.8 saving data");
            //dedup what we sent
            //let seenurls=[]
            //let strippedtosend=[]
            //for (const element of bookstore_default.bookmarks) {
            //}
              
            let syncres=await github_gist_file_create(context,GHPAT,mystorageid,"bookmarks.json",JSON.stringify(bookstore_default,null, 2))
            console.log("syncres:"+syncres)
            //if(syncres.includes('"status":"ok"')||syncres.status==204||syncres.staus==201||syncres.status==200) {
            if((  syncres.includes('"status":"ok"')|| ("status" in syncres) && syncres.status=="ok" )||syncres.status==204||syncres.staus==201||syncres.status==200) {
             console.log("sync ok ..processing delcommments")
             let deleted_number=0
             //changes.delurls_comment.forEach(async element => {
              for (const element of changes.delurls_comment) {
               deleted_number++
               console.log("delcomment "+ deleted_number + "| " +element)
               const delcommentinit = {
                method: "DELETE",
                headers: {
                  "Accept": "application/vnd.github+json",
                  "content-type": "application/json;charset=UTF-8",
                  "X-GitHub-Api-Version": "2022-11-28",
                  "User-Agent": "GistMarksCloud/0.1 Firefox/666",
                  "Authorization": "Bearer "+GHPAT,
                },
              };
                //async_error_handler(context,JSON.stringify(commentinit))
                const commenturl=element
                const delres = await fetch(commenturl, delcommentinit);
                if(delres.status==204||delres.staus==201||delres.status==200) {
                  console.log("del_comment "+deleted_number + " OK")
                } else {
                  async_error_handler("del_comment "+deleted_number + " FAIL "+ delres.status )
                }
            // }); // end forech
              } // end for (const element of changes.delurls_comment) { 
            } // end syncres
           } // end changes
           if(lock_sent==true) {
            console.log("removing lock")
            //context.waitUntil( await github_gist_update_description(context,GHPAT,GIST,status_msg_create(USERSTRING,localDate+"|SYNC")) );
            const lockres=await github_gist_update_description(context,GHPAT,GIST,status_msg_create(USERSTRING,localDate+"|SYNC"))
            console.log("unlockres"+lockres)
           } 
          } // end comments found
          console.log("building list")
          //async_error_handler(context,JSON.stringify(commentinit))
          // build the returnable list
//user gets redirected
         // let listing: Link[]=[];

         //   for (const curmark of bookstore_default.bookmarks) {
         //     try {
         //   //returnthing.push(Link: curmark)
         //   //console.log(curmark)
         //   let curlink: Link = {
         //     url: curmark.url,
         //     key: curmark.key,
         //     title: curmark.title
         //   };
         //   if("description" in curmark) {
         //     curlink.description=curmark.description
         //   }
         //   if("action" in curmark ) {
         //     delete curmark["action"]
         //   }
         //   if(("description" in curmark ) && curmark.descrpti) {
         //     delete curmark["action"]
         //   }
         //   if("ts" in curmark ) {
         //     delete curmark["action"]
         //   }
         //   if("image" in curmark && (curmark.image!="")) {
         //     if(IMAGEPROXY=="false") {
         //      curlink.image=curmark.image
         //     } else {
         //       const imgrequestURL=new URL(await curmark.image)
         //       curlink.image=IMAGEPROXY+encodeURIComponent(imgrequestURL.toString())
         //     }
         //   } else {
         //     if(IMAGEFALLB!="false") {
         //       curlink.image=IMAGEFALLB+encodeURIComponent(imgrequestURL.toString())
         //     }
         //   }
         //   listing.push(curlink)
         // } catch(e) {
         //   console.log("error during list_create , err:"+e+"| elem:" +curmark)
         //  }
         //   
         //  } // end for bookmark push
        ////------------------ end processing 
        console.log("endprocessing")
        //let returnthing: ListResult = {
        //    links: listing,
        //    cursor: "0",
        //    complete: true
        //  }
        //  return returnthing
        let sendfilename="bookmarks.json"

        return JSON.stringify({status:"ok",redirect: "https://gist.githubusercontent.com/"+GHUSR+"/"+mystorageid+"/raw/"+sendfilename })
  } catch (err) {
    async_error_handler(context,'error ' + err)
    return(JSON.stringify({ status: "error" , message: err }))
  } // end try 
return false
}

const deleteLink = async (url: string,context: FetchEvent): Promise<boolean> => {
  if (!isURL(url)) throw new Error(url + ' is not URL')
  //await deleteLink(url)
  //console.log("fetchogp")
  //const ogp = await fetchOGP(url,title)
  const linkKey = PREFIX + await makeKey(url)
  ogp.key = linkKey
  let mycat=""
  if(cat!="") { mycat=cat  }
  const ogpKey = OGP_PREFIX + url
  try {
    //let cmstring=JSON.stringify(ogp, null, 2); 
    ogp.action="del"
    const commentinit = {
      //body: '{"body":"This is a comment to a gist at'+localDate+'"}',
      //body: '{"body":"add|'+localDate+'|'+btoa(JSON.stringify(ogp))+'"}',
      body: JSON.stringify( { body: JSON.stringify(ogp) }) ,
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GistMarksCloud/0.1 Firefox/666",
        "Authorization": "Bearer "+GHPAT,
      },
    };
    //async_error_handler(context,JSON.stringify(commentinit))
    const commenturl= "https://api.github.com/gists/"+GIST+"/comments"
    async_error_handler(context,"saving "+await makeKey(url)+" to "+ commenturl)
    const response = await fetch(commenturl, commentinit);
    let result=await response.status;
    async_error_handler(context,"got_"+result)
    if((await response.status!=200)&& (await response.status!=201)) {
        async_error_handler(context,await response.text())
        return false
    } else {
    return true
    }
    } catch (err) {
    async_error_handler(context,'error ' + err)
    return false
  }
}

const addLink = async (url: string, cat: string,title: string,notes: string,context: FetchEvent,namespace: KVNamespace): Promise<string> => {
  const myuseragent= userAgentList[userAgentList.length * Math.random() | 0]
  if (!isURL(url)) throw new Error(url + ' is not URL')
  //await deleteLink(url)
  console.log("fetchogp")
  let mycat="default"
  if(cat!="") { mycat=cat  }
  let mynotes=""
  if(notes!="") {
    mynotes=notes
  }
  const CFcache = caches.default;
  const confcacheurl= "https://gist.githubusercontent.com/"+GHUSR+"/"+GIST+"/raw/"+CONFIGFILE
  let cachedconfig=false
  let cachesource="NONE"
  let configfound=false
  let myconfig={}
  let mainsource={}
  let mystorage=""
  let mystorageid=""
  let ownerurl='https://api.github.com/users/'+GHUSR

  let confcacheresponse = await CFcache.match(confcacheurl.toString());
   if (!confcacheresponse) { console.log('url: '+confcacheurl+' not present in cache')
  } else {
    let myrestxt=await confcacheresponse.text()
    let tmpconfig=JSON.parse(myrestxt)
    if(typeof tmpconfig === 'object' &&      !Array.isArray(tmpconfig) &&      tmpconfig !== null && "storageloc" in tmpconfig) {
        console.log("config native_cached:");cachedconfig=true;configfound=true;cachesource="native"
        myconfig=tmpconfig
    }
   //console.log(myrestxt)
  }
  if(!configfound) {
  try {
   const confkvresponse = await namespace.get(btoa(confcacheurl.toString())); 
   if (confkvresponse === null || confkvresponse === undefined) {            
     console.log('url: '+confcacheurl+' not present in kv')          
     }   else {  
      let tmpconfig=JSON.parse(atob(confkvresponse)) 
      if(typeof tmpconfig === 'object' &&      !Array.isArray(tmpconfig) &&      tmpconfig !== null && "storageloc" in tmpconfig) {
      cachesource="kv";           cachedconfig=true
      console.log('url: '+confcacheurl+' CACHED FROM kv')
      //console.log(atob(confkvresponse))
      myconfig=tmpconfig
      }

     }
  } catch(e) { console.log("failed on KV:"+e)}
  }
if( (!(typeof myconfig === 'object') &&      Array.isArray(myconfig) &&      myconfig === null) ||  ( !("owner" in myconfig) || !("storageloc" in myconfig) ) ) {
          //console.log("fetch")

           mainsource=await github_gist_get_json_auth_sync(context,GHPAT,GIST)
           myconfig=JSON.parse(await mainsource.files[CONFIGFILE].content)
           //console.log(myconfig)
           //main_gistJSON=mainsource
           mainsource={}
          }
      if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ( ("owner" in myconfig) && ("storageloc" in myconfig))){ 
        configfound=true
      }
      console.log("before setup")
      if(typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ( !("owner" in myconfig) || !("storageloc" in myconfig) ) ) {
        //even after fetching , we do not have a config
        //( maybe setup did not run ... ) 
        console.log("booting..setup default config")
        const initrdmstr = '' +
        '# Bookmarks [Storage](https://github.com/thefoundation/cloudflare-gist-marks) <br>' +
        'Hi , here we just store our content for the real gist '+
        '<hr>'+
        '	<span> Gist-Marks powered by:<b>❤ unicorns &amp;	</b></span>'+
        '	' +
        '<a href="https://the-foundation.gitlab.io/"><div><img src="https://is.gd/gistmarkslogov1" width="240" height="135"/></div></a>'+
        '';
        let storage_init=await github_gist_create(context,GHPAT,"gistmark-storage for "+GIST,initrdmstr)
        console.log(storage_init)
        if(("status" in storage_init)&&(storage_init.status=="ok")) {
          console.log("saving default config")
          const mystorageloc=storage_init.url
          const newconfig={ storageloc: mystorageloc , time: localDate , owner: 'https://api.github.com/users/'+GHUSR }
          ownerurl='https://api.github.com/users/'+GHUSR
          context.waitUntil( await github_gist_file_create_and_cache(context,GHPAT,GIST,GHUSR,CONFIGFILE,JSON.stringify(newconfig,null," "),namespace) );
          myconfig=newconfig
          //if(typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && !("storageloc" in myconfig) ) {
          //  mainsource=await github_gist_get_json_auth_sync(context,GHPAT,GIST)
          //  myconfig=JSON.parse(await mainsource.files[CONFIGFILE].content)
          //  main_gistJSON=mainsource
          //  mainsource={}
          // }
        } else {
          async_error_handler(context,"FAILED SETTING UP STORAGE")
          //const failelem={ "FAILED SETTING UP STORAGE" ,true}
          //return failelem
          return false
        }
        if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && !("storageloc" in myconfig)){
        console.log("could not get storageloc from gist json even after creating" )
        console.log(mainsource)
        return false;
        }

          //return "hello string"
        } //end setup or error
        console.log("getting owner")
        if (typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig && ("owner" in myconfig)){
          ownerurl=myconfig.owner
        }

        //console.log(configfound)
        //console.log(myconfig)
        //console.log(ownerurl) // GISTMARKS_USER_NOT_SET
        if( !("owner" in myconfig) || !("storageloc" in myconfig)) {
          console.log("NEED STORAGELOC AND OWNER")
          console.log(myconfig)
          return false;
         } else {
          configfound=true
          console.log("foundconfig")
          console.log(JSON.stringify(myconfig.storageloc))
          mystorage=myconfig.storageloc
          //console.log(mystorage)
          mystorageid=await mystorage.split("/").pop();
         }

        if(!configfound) {
          console.log( "at this point we NEED a config")
          return false;
        } 
        // -----------------  start processing
        if(!cachedconfig) { console.log("config_from_gist") }
  const confcachekey=await btoa(await confcacheurl.toString())

  if(cachedconfig && (cachesource!="NONE")&&(cachesource!="native")) {
    if(myconfig && typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig) {
    const cacheinit = {
      method: "GET",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent":  myuseragent,
        //"Authorization": "Bearer "+pat,
      },
    };
    //async_error_handler(context,JSON.stringify(fileinit))
    const cachefileurl= "https://gist.githubusercontent.com/"+GHUSR+"/"+GIST+"/raw/"+CONFIGFILE
    const cacheconfresp=fetch(cachefileurl,cacheinit)
    console.log("got_"+(await cacheconfresp).status+ " on caching ")

    try {
      //async_error_handler(context,JSON.stringify(fileinit))
      const cacheconfresp=fetch(confcacheurl,cacheinit)
      context.waitUntil(await console.log(await JSON.stringify((await CFcache.put(await cachefileurl.toString(), await cacheconfresp)))));
  
    } catch (ea) {          console.log("©error storing to native cache"+ea)}  
   }
  }
  if(cachedconfig && (cachesource!="NONE")&&(cachesource!="kv")) {
    try {
      //console.log(namespace)
      if(myconfig && typeof myconfig === 'object' &&      !Array.isArray(myconfig) &&      myconfig !== null && "storageloc" in myconfig) {
          //context.waitUntil(await console.log(await JSON.stringify((await namespace.put( await confcachekey, await btoa(await main_gistJSON.files[CONFIGFILE].content))))));
          context.waitUntil(await console.log(await JSON.stringify((await namespace.put( await confcachekey, await btoa(JSON.stringify(myconfig)))))));
      }
      } catch (eb) {
      console.log("©error storing to kv cache"+eb)
    }
  }
  const ogp = await fetchOGP(url,title,mycat,mynotes)
  const linkKey = PREFIX + await makeKey(url)
  ogp.key = linkKey

  const ogpKey = OGP_PREFIX + url
  //await BOOKMARK.put(ogpKey, JSON.stringify(ogp))
  try {
    //await BOOKMARK.put(linkKey, url, {
    //  metadata: ogp,
    //})
    let localDate = Date.now();  // will return actual current date
    //const sendcommentbody= {
    //  body: btoa(bodystring) 
    //}
    //let cmstring=JSON.stringify([ ogp ], null, 2); 
    //async_error_handler(context,cmstring)
    //cmstring=cmstring.replace('"','\"')
    //cmstring='{"body":"\{\"key\":\"v1:link:98291792594427\",\"message\":\"Link added\",\"url\":\"https://ifconfig.co/json\"\}"}'
    //async_error_handler(context,cmstring)
    ogp.action="add"
    ogp.ts=localDate
    ogp.cat=mycat
    const commentinit = {
      //body: '{"body":"add|'+localDate+'|'+btoa(JSON.stringify(ogp))+'"}',
      //body: '{"body":"'+cmstring+'"}',
      body: JSON.stringify( { body: JSON.stringify([ogp]) }) ,
      //body: '{"body":"This is a comment to a gist at'+localDate+'"}',
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "content-type": "application/json;charset=UTF-8",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "GistMarksCloud/0.1 Firefox/666",
        "Authorization": "Bearer "+GHPAT,
      },
    };
    //async_error_handler(context,JSON.stringify(commentinit))
    const commenturl= "https://api.github.com/gists/"+mystorageid+"/comments"
    async_error_handler(context,"saving "+ogpKey+" to "+ commenturl)
    const response = await fetch(commenturl, commentinit);
    let result=await response.status;
    async_error_handler(context,"got_"+result)
    if((result!=200)&& (result!=201)) {
        async_error_handler(context,await response.text())
    }
  } catch (err) {
    async_error_handler(context,'error ' + err)
  }
  return linkKey
}

export { getLinks, addLink, deleteLink , genKeyPair }