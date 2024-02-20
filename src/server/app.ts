import { fetchOGP, OGP } from './ogp'
import { isURL, makeKey } from '../util'
import { Link, ListResult } from '../types'
import { Context } from 'hono'

//declare let GHPAT: string
//declare let GIST: string
//declare let BOOKMARK: KVNamespace
const PREFIX: string = 'v1:link:'
const OGP_PREFIX: string = 'v1:ogp:'
const DEBUGME: boolean = true
const DEBUGMEHARDER: boolean = true
const ALLOWEDUSERS: string = '["nobody"]'
const USERSTRING: string = "another user"

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
    async_error_handler(context,"got_"+result)
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

const getLinks = async (cursor: string | undefined,category: string | "all" , limit: number = 20,context: FetchEvent): Promise<ListResult> => {
  let localDate = Date.now();  // will return actual current date
  var changes={ count: 0, del: 0 , add: 0,upd: 0, delurls_comment: [  ] }
  let lock_sent=false
  //const list = await BOOKMARK.list<Link>({ prefix: PREFIX, limit: limit, cursor: cursor })
  //const list={ arr }
  //const keys = list.keys
  //const links = keys
  //  .map((value) => value.metadata)
  //  .filter((link): link is Link => link != undefined)
  //return { links: links, cursor: list.cursor, complete: list.list_complete }
  async_error_handler("getlinks")
  try {
      const filelistinit = {
        method: "GET",
        headers: {
          "Accept": "application/vnd.github+json",
          "content-type": "application/json;charset=UTF-8",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "GistMarksCloud/0.1 Firefox/666",
          "Authorization": "Bearer "+GHPAT,
        },
      };
        //async_error_handler(context,JSON.stringify(commentinit))
        const gisturl= "https://api.github.com/gists/"+GIST
        async_error_handler(context,"1. get db")
        const response = await fetch(gisturl, filelistinit);
        let result=await response.status
        async_error_handler(context,"got_"+result)
        if(!(await response.status==200) || (await response.status==201)) {
            async_error_handler(context,await response.text())
            return false
        } else {
            //let gistresp=await response.text()
            //let gistJSON = JSON.parse(gistresp.replace(/^\[/, "").replace(/\]$/, ""))
            //var gistJSON = eval("(function(){return " + data + ";})()");
            //async_error_handler(context,objJSON.result);​
           ///const { value: bodyIntArray } = await response.body.getReader().read()
           ///const bodyJSON = new TextDecoder().decode(bodyIntArray)
           ///async_error_handler(context,bodyJSON)
           ///const gistJSON=JSON.parse(bodyJSON)
           const  gistJSON   = await response.json()
           //async_error_handler(context,gistJSON)
           //const files=gistJSON.files
           const ownerurl=gistJSON.owner.url
           let allowusers=[]
           try {
               allowusers=await JSON.parse(ALLOWEDUSERS)
               console.log("ALLOWusers_parsed")
               allowusers.push(ownerurl)
            } catch(e) {
              allowusers=[ownerurl]
              async_error_handler(context,"err: allow users not parseable: "+e)
            }
           //console.log(ownerurl)
           //async_error_handler(context,"owner "+ownerurl)
           let configfound=false
           let categofound=false
           let bookjsfound=false
           let truncated=[]
           let readmefound=false
           let nondefault_store=[]
           let bookstore_empty={
            version: 0,
            date: localDate,
            bookmarks: [
            ]
            }
           let bookstore_default={
           version: 0,
           date: localDate,
           bookmarks: [
            {"url":"https://github.com/thefoundation/cloudflare-gist-marks","cat":"default","title":"CCC | Startseite","description":"","key":"v1:link:98291777075111"},
            {"url":"https://github.com","cat":"default","title":"GITHUB.com , a great place to code","description":"","key":"v1:link:98291777075222"}
           ]
           }
           if('files' in gistJSON) {
            console.log("scan files")
            Object.keys(gistJSON.files).forEach(filename => {
              //async_error_handler(context,filename)
              //async_error_handler(context,gistJSON.files[filename])
              if(filename=="README.md")                    { readmefound=true         }
              if(filename=="bookmarks.json")               { bookjsfound=true         }
              if(filename=="GistMarksCloud-category.json") { readmefound=true         }
              if(filename=="GistMarksCloud-settings.json") { configfound=true         }
              if(gistJSON.files[filename].truncated==true)  { truncated.push(filename) }
            });
           }
           console.log("done file_scan")
           if( bookjsfound==false ) { 
                console.log("0 no default json")
           } else {
            if(truncated.includes("bookmarks.json")) {
              console.log("getting full bookmarks.json")
              //const fulldefurl="https://gist.githubusercontent.com/username/GISTID/raw/README.md" (works without commit id)
              const fulldefurl=gistJSON.files["bookmarks.json"].raw_url;
              const fulldefinit = {
                method: "GET",
                headers: {
                  "Accept": "application/vnd.github+json",
                  "content-type": "application/json;charset=UTF-8",
                  "X-GitHub-Api-Version": "2022-11-28",
                  "User-Agent": "GistMarksCloud/0.1 Firefox/666",
                  // "Authorization": "Bearer "+GHPAT,
                },
              };
                //async_error_handler(context,JSON.stringify(fulldefinit))
                async_error_handler(context,"1. get full default file")
                const response = await fetch(fulldefurl, fulldefinit);
                console.log("trying default json")
                bookstore_default=await response.json()
            } else {
                console.log("using present json")
                // we have full default file from first api request
                //console.log(JSON.stringify(await gistJSON.files["bookmarks.json"]))
                bookstore_default=JSON.parse(await gistJSON.files["bookmarks.json"].content)
                async_error_handler(context,"1. hav full default file")
            }
           }
           if(!readmefound) {
            async_error_handler(context,"0 init README")
            const str = '' +
            '# Bookmarks [Collection](https://github.com/thefoundation/cloudflare-gist-marks) <br>' +
            ''+
            '<hr>'+
            '	<span> Gist-Marks powered by:<b>❤ unicorns &amp;	</b></span>'+
            '	' +
            '<a href="https://the-foundation.gitlab.io/"><div><img src="https://hcxi2.2ix.ch/github/github.com/thefoundation/cloudflare-gist-marks/README.md/logo.jpg" width="240" height="135"/></div></a>'+
            '';
            //async_error_handler(context,"sending "+str)
            //fork thisjob
            context.waitUntil( await github_gist_file_create(context,GHPAT,GIST,"README.md",str) );
           }           
           //if(!configfound) {
           // async_error_handler(context,"1 init GistMarksCloud-settings.js")
           // default={ url: "https://github.com/thefoundation/cloudflare-gist-marks", description:"gist-marks-home"}
           // github_gist_file_create(GHPAT,GIST,"GistMarksCloud-settings.js",JSON.stringify(default))
           //}
           //async_error_handler(context,"searching comments")
           //default={ url: "https://github.com/thefoundation/cloudflare-gist-marks", description:"gist-marks-home"}
           if('comments' in gistJSON && gistJSON.comments !=0 ) {
            async_error_handler(context,gistJSON.comments+" comments found")
             // uncommitted bookmarks ( and potential comment from other users since we cannot prohibit commenting on secret gists )
             const commenturl= "https://api.github.com/gists/"+GIST+"/comments?per_page=100"
             async_error_handler(context,"listing files from"+commenturl)
             const commentinit = {
              cf: {
                // Always cache this fetch regardless of content type
                // for a max of 5 seconds before revalidating the resource
                cacheTtl: 0,
                cacheEverything: false,
              },
              method: "GET",
              headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "GistMarksCloud/0.1 Firefox/666",
                "Authorization": "Bearer "+GHPAT,
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
                 let elmcount=0
                  //commentsJSON.forEach( async element => {
                    for (const element of commentsJSON) {
                    elmcount=elmcount+1
                    let commentowner=element.user.url
                    //async_error_handler(context,element)
                    if("body" in element) {
                      async_error_handler(context,commentowner);
                      if(allowusers.includes(commentowner)) {
                      try {
                        if(isJSON(element.body)) {
                          let commentbody=JSON.parse(element.body)
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
                                  context.waitUntil( await github_gist_update_description(context,GHPAT,GIST,status_msg_create(USERSTRING,localDate+"|UPDATING")) );
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
                                if("ts" in commentbody) {
                                  async_error_handler(context,"2.5         found ts");
                                } else {
                                  commentbody.ts=localDate
                                  async_error_handler(context,"2.5 using default ts");
                                }                                
                                if(commentbody.cat=="default") {
                                  async_error_handler(context,"2.6 adding elem | default |");
                                  let strippedlist=await getStoreWithoutLink(commentbody.url,bookstore_default.bookmarks)
                                  //async_error_handler("deflen: "+bookstore_default.bookmarks.length)
                                  //async_error_handler("strippedlen: "+strippedlist.length)
                                  if((strippedlist.length) < bookstore_default.bookmarks.length) {
                                      // the element was already bookmarked
                                      async_error_handler(context,"2.6 pop_and_push")
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
                        } else {
                          async_error_handler(context,"comment body found but no json")
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
           
                 console.log(changes)
              } catch (err) {
                 async_error_handler(context,'error_parsing_comments' + err)
            }
           }  
           //await async_error_handler(context,"2.8 done processing..will delete "+ await delcnt + " comments on submit");
           if((changes.delurls_comment.length!=0) && (changes.count!=0)) {
            await async_error_handler(context,"2.8 saving data");
            let syncres=await github_gist_file_create(context,GHPAT,GIST,"bookmarks.json",JSON.stringify(bookstore_default,null, 2))
            console.log("syncres:"+syncres)
            if(syncres.includes('"status":"ok"')||syncres.status==204||syncres.staus==201||syncres.status==200) {
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
              } // end for 
            }
           // end comments found 
           }
           if(lock_sent==true) {
            console.log("removing lock")
            //context.waitUntil( await github_gist_update_description(context,GHPAT,GIST,status_msg_create(USERSTRING,localDate+"|SYNC")) );
            const lockres=await github_gist_update_description(context,GHPAT,GIST,status_msg_create(USERSTRING,localDate+"|SYNC"))
            console.log("unlockres"+lockres)
           }
          } // end valid gist api response

           //await async_error_handler(context,JSON.stringify(bookstore_default));

           //async_error_handler(context,files["bookmarks.json"])
           //async_error_handler(context,JSON.stringify(JSON.parse(await response.text())));
          // build the returnable list
          let listing: Link[]=[];
          for (const curmark of bookstore_default.bookmarks) {
            //returnthing.push(Link: curmark)
            let curlink: Link = {
              url: curmark.url,
              key: curmark.key,
              title: curmark.title
            };
            if("description" in curmark) {
              curlink.description=curmark.description
            }
            if("image" in curmark) {
              curlink.image=curmark.image
            }
            //export type Link = {
            //  url: string
            //  key: string
            //  title: string
            //  description?: string
            //  image?: string
            //}
            listing.push(curlink)
          }
          let returnthing: ListResult = {
            links: listing,
            cursor: "0",
            complete: true
          }
          return returnthing
          //return "hello string"
        } //end fetch_status_ok
  } catch (err) {
    async_error_handler(context,'error ' + err)
    return(JSON.stringify({ status: "error" , message: err }))
  } // end try 
return false
}

const deleteLink = async (url: string,context: FetchEvent): Promise<boolean> => {
  if (!isURL(url)) throw new Error(url + ' is not URL')
  //await deleteLink(url)
  const ogp = await fetchOGP(url,title)
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
    async_error_handler(context,"saving "+ogpKey+" to "+ commenturl)
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

const addLink = async (url: string, cat: string,title: string,notes: string,context: FetchEvent): Promise<string> => {
  if (!isURL(url)) throw new Error(url + ' is not URL')
  //await deleteLink(url)
  const ogp = await fetchOGP(url,title)
  const linkKey = PREFIX + await makeKey(url)
  ogp.key = linkKey
  let mycat=""
  if(cat!="") { mycat=cat  }
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
    let cmstring=JSON.stringify(ogp, null, 2); 
    //async_error_handler(context,cmstring)
    //cmstring=cmstring.replace('"','\"')
    //cmstring='{"body":"\{\"key\":\"v1:link:98291792594427\",\"message\":\"Link added\",\"url\":\"https://ifconfig.co/json\"\}"}'
    //async_error_handler(context,cmstring)
    ogp.action="add"
    ogp.ts=localDate
    const commentinit = {
      //body: '{"body":"add|'+localDate+'|'+btoa(JSON.stringify(ogp))+'"}',
      //body: '{"body":"'+cmstring+'"}',
      body: JSON.stringify( { body: JSON.stringify(ogp) }) ,
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
    const commenturl= "https://api.github.com/gists/"+GIST+"/comments"
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