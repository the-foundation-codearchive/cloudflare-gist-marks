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

  const meta = doc.getElementsByTagName('meta')
  if (meta) {
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
    let title=""
    if(mytitle!="") {
      title = mytitle
    } else {
      let tmptitle = data['og:title']
      if(tmptitle) {title=tmptitle}
      if(!tmptitle) {
          const elements = doc.getElementsByTagName('title')
          title = elements ? elements[0].textContent : url
      }
    }
    let sendcat="default"
    if(mycat!="") {
      let sendcat=mycat;
    } 

    ogp = {
      url: url,
      cat: sendcat,
      title: title,
      image: data['og:image'],
    }
    let desctmp=truncateString(data['og:description'], 60)
    if(desctmp!="") {
      ogp.description=desctmp
    }
  } else {
    ogp = {
      url: url,
      title: url,
    }<fmetata
  }

  ogp.title = decode(ogp.title)
  ogp.description = ogp.description ? decode(ogp.description) : ogp.description
  return ogp
}

export { fetchOGP, OGP }
