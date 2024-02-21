import DOMParser from 'dom-parser'
import { decode } from 'html-entities'
import { OGP } from '../types'

const truncateString = (str: string, length: number) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length - 3) + '...' : str
}

const extractCanonical = (doc: DOMParser.Dom): string | null => {
  const links = doc.getElementsByTagName('link')
  if (links) {
    for (const i in links) {
      const rel = links[i].getAttribute('rel')
      if (rel && rel.toLowerCase() == 'canonical') {
        const url = links[i].getAttribute('href')
        return url
      }
    }
  }
  return null
}

const fetchOGP = async (url: string,mytitle: string,mycat: string,notes: string): Promise<OGP> => {
  let ogp: OGP
  const response = await fetch(url)
  const html = await response.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(html)
  url = extractCanonical(doc) || url
  let desctmp=""
  const meta = doc.getElementsByTagName('meta')
  let title=""

  let sendcat="default"
  if(mycat!="") {
    let sendcat=mycat;
  } 
  if (meta) {
    console.log("have_meta")
    const data = Array.from(meta)
      .filter((element) => element.getAttribute('property'))
      .reduce((pre: Record<string, string>, ogp) => {
        const property = ogp.getAttribute('property')
        const content = ogp.getAttribute('content')
        if (property && content) {
          pre[property] = content
        }
        return pre
      }, {})
      console.log("check_title")
      if(data && ("og:title" in data )) {
        let title=data['og:title']
      } else {
        const elements = doc.getElementsByTagName('title')
        title = elements ? elements[0].textContent : url
      }
    console.log("override_title")
    if(await mytitle && await mytitle!="") {
      console.log("og_title given")
      title = await mytitle
    }
    ogp = {
      url: url,
      cat: sendcat,
      title: title,
    }
  console.log("meta_image")
  if("og:image" in data ) {
    ogp.image=data['og:image']
  }
  console.log("meta_desc")
  if("og:description" in data) {
    desctmp=truncateString(data['og:description'], 60)
  }

  } else {
    // no meta
    ogp = {
      url: url,
      title: url,
    }<meta
  }

console.log("desc")
  if(desctmp!="") {
    ogp.description=desctmp
  }
  ogp.title = decode(ogp.title)
  ogp.description = ogp.description ? decode(ogp.description) : ogp.description
  ogp.cat=sendcat
  return ogp
}

export { fetchOGP, OGP }
