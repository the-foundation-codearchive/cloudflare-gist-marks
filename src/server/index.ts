import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { basicAuth } from 'hono/basic-auth'
// const { SodiumPlus } = require('sodium-plus');

import { getLinks, addLink, deleteLink , genKeyPair } from './app'


declare let NAME: string
declare let PASS: string

declare let GIST: string
declare let GHPAT: string

//const hono = new Hono()
const app = new Hono()

//GIST JS example //https://gist.github.com/benchonaut/bbd2b087bfb9ee6675cb7a44f6f7f366.js

app.use('/edit.html', basicAuth({ username: NAME, password: PASS }))
app.use('/edit', basicAuth({ username: NAME, password: PASS }))
//app.use('/static/*', serveStatic({ root: './static/' }))
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/edit', serveStatic({ path: './edit.html' }))
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
    const key = await addLink(requestUrl,sendcat,sendtitle,sendnotes)
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
  return c.text('POST /')})
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
    const links = await getLinks(cursor,category,Number(limit),   c.event )
    return c.json(links)
  })
app.use('/links', basicAuth({ username: NAME, password: PASS }))
app.use('/links/*', basicAuth({ username: NAME, password: PASS }))
  
//export default app
app.fire()