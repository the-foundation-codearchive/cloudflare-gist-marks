import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { basicAuth } from 'hono/basic-auth'
import { indexhtml } from './indexhtml'
import type { KVNamespace } from '@cloudflare/workers-types'

// const { SodiumPlus } = require('sodium-plus');

import { getLinks, addLink, deleteLink , genKeyPair } from './app'

declare let NAME: string
declare let PASS: string

declare let GIST: string
declare let GHPAT: string
declare let GHUSR: string
//declare let CACHE: KVNamespace;

//const hono = new Hono()

// The secrets and variables from the cloudflare worker process.
// Available from `c.env`
export type Env = {
	//ASSETS: Fetcher;
	//ENVIRONMENT_VARIABLE_1: string;
	//ENVIRONMENT_VARIABLE_2: string;
	//HONO_PAGES_BLOG_POSTS: KVNamespace;
	CACHE: KVNamespace;
};
type Bindings = {
  CACHE: KVNamespace
  //Storage: R2Bucket
}
export interface Env {
  CACHE: KVNamespace;
  //BW: Fetcher;
  //URL: string;
 }
// Custom variables that can be set and retrieved from context using `c.set` and `c.get`
// https://honojs.dev/docs/api/context/#csetcget
export type CustomVariables = {
	//counter: number;
  CACHE: KVNamespace;

};
///const app = new Hono<{ Variables: CustomVariables; Bindings: Bindings }>()
type AppContext = {
  Bindings: {
    CACHE: KVNamespace
  }
}
const app = new Hono<AppContext>()
//GIST JS example //https://gist.github.com/username/GISTID.js

  app.use('*', cors({
    origin: ['https://gist-marks.pages.dev', 'https://marks.gistmarks.workers.dev'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}))
app.use('/links', basicAuth({ username: NAME, password: PASS }))
app.use('/links/*', basicAuth({ username: NAME, password: PASS }))
app.use('/gistmarks.html', basicAuth({ username: NAME, password: PASS }))
app.use('/gistmarks', basicAuth({ username: NAME, password: PASS }))
//app.use('/static/*', serveStatic({ root: './static/' }))
//app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))
      //
app.get('/favicon.ico',(c) =>  {  
  return c.redirect("https://is.gd/gistmarkslogov1",301)
 /// console.log("prepar redir")
 /// c.header('pragma', 'no-cache')
 /// c.header('expires', '-1')
 /// c.header('Cache-Control', 'no-cache,max-age=0,no-store,s-maxage=0,proxy-revalidate')
 /// c.header('Location', JSON.parse(links).redirect)
///
 /// //c.redirect(links.redirect)
 ///// const redirinit={
 /////   'pragma': 'no-cache',
 /////   'Cache-Control': 'no-cache,max-age=0,no-store,s-maxage=0,proxy-revalidate',
 /////  'X-Message': 'HEYA',
 /////  'Expires': '-1',
 /////  'Location': links.redirect,
 /////  'Content-Type': 'text/plain',
 /////}
 ///console.log("sending redir")
 ///return c.text('sending you to gist', 302)
})

app.get('/gistmarks', serveStatic({ path: './gistmarks.html' }))
app.get('/gistmarks.html', serveStatic({ path: './gistmarks.html' }))
app.get('/gistmarks.js', serveStatic({ path: './gistmarks.js' }))

app.get('/', (c) =>  {  
  //return c.html(await indexhtml.replace("/gist-via-github.js","https://gist.github.com/'+GHUSR+'/'+GIST+'.js"))
  return c.html(indexhtml.replace("/gist-via-github.js","https://gist.github.com/"+GHUSR+"/"+GIST+".js"))
})
app.get('/*', serveStatic({ root: './' }))
app.get('/static/*', serveStatic({ root: './static/' }))
app.post('/link_add',async (c) => {
  console.log("link_add");
  let requestBody = await c.req.parseBody()
  //console.log(requestBody)
  if (!('url' in requestBody)) { 
    console.log("tryjson")
    //console.log(c.req.text())
    try {
      let tmpobj=JSON.parse(await c.req.text())
      console.log("json.parsed")
      if("url" in tmpobj) {
        requestBody=tmpobj
      }
  } catch (errrr) {
    /// nothing
  }
  }

  if ('url' in requestBody) {
    const requestUrl = requestBody.url
    let sendtitle=""
    let sendcat=""
    let sendnotes=""
    if ('title' in requestBody) { sendtitle=requestBody.title }
    if ('cat' in requestBody)   {   sendcat=requestBody.cat   }
    if ('notes' in requestBody) { sendnotes=requestBody.notes }
    const key = await addLink(requestUrl,sendcat,sendtitle,c.event,c,CACHE)
    const responseBody = {
      url: requestUrl,
      message: 'Link queued',
      key: key,
    }
    return c.json(responseBody)
  }  else {
        //return c.notFound()
        return c.text('Error: data_invalid no_url_given', 400)
  }
  //return c.text('POST /')
})

app.delete('/links_del', async (c) => {
    //const requestBody = c.req.parsedBody
    const requestBody = c.req.parseBody()
  
    if ('url' in requestBody) {
      const requestUrl = requestBody.url
      const deleted = await deleteLink(requestUrl)
      const responseBody = {
        deleted: deleted,
        message: 'Link deleted',
        url: requestUrl,
      }
      return c.json(responseBody)
    } else {
      return c.notFound()
    }
  })
  app.get('/links_get', async (c) => {
    const cursor = c.req.query('cursor') || "1"
    const category = c.req.query('cat') || ""
    const limit = c.req.query('limit') || '20'

 // const kv = await c.env.CACHE // kv is KVNamespace
 //console.log(await c.env)
    const links = await getLinks(cursor,category,Number(limit),   c.event ,CACHE)
   //const links=[];
    //return c.json(links)
    if(links&&JSON.parse(links).status=="ok"&& ("redirect" in JSON.parse(links))) {
      console.log("prepar redir")
      c.header('pragma', 'no-cache')
      c.header('expires', '-1')
      c.header('Cache-Control', 'no-cache,max-age=0,no-store,s-maxage=0,proxy-revalidate')
      c.header('Location', JSON.parse(links).redirect)

      //c.redirect(links.redirect)
     // const redirinit={
     //   'pragma': 'no-cache',
     //   'Cache-Control': 'no-cache,max-age=0,no-store,s-maxage=0,proxy-revalidate',
     //  'X-Message': 'HEYA',
     //  'Expires': '-1',
     //  'Location': links.redirect,
     //  'Content-Type': 'text/plain',
     //}
     console.log("sending redir")
     return c.text('sending you to gist', 302)

      //return c.body('sending you to gist', 200, redirinit)
      //await next()

    }
  })

  
//export default app
app.fire()