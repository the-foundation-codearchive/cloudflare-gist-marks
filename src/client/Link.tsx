import React from 'react'
import { Image } from 'react-bootstrap'
import { isURL, truncateString } from '../util'
import type { Link } from '../types'

type Props = {
  link: Link
}

export const List: React.VFC<Props> =  (props) => {
  const link = props.link
   if(!("image" in link )|| link.image=="" || link.image.startsWith("/")) { 
    logtty("adding link image for"+JSON.stringify(link))
     const tmpurl= new URL(link.url) ;
     logtty("got new url")
  ////   myLocalXHR = new XMLHttpRequest();
  ////   myLocalXHR.imgtag=imgtags[i];
  ////   myLocalXHR.responseType = 'blob';
  ////   myLocalXHR.sourceURL=imgtags[i].dataset.src;
  ////   myLocalXHR.onreadystatechange = function() {
  ////       var imgtag , sourceURL;
  ////       if (this.readyState == 4 && this.status == 200) {
  ////          console.log("replacing "+this.sourceURL+"type "+this.getResponseHeader('content-type'));
  ////          var tmpurl=window.URL.createObjectURL(this.response);
  ////          this.imgtag.src=tmpurl;
  ////          this.imgtag.dataset.src=tmpurl
  ////       }
  ////   };
  ////   myLocalXHR.open("GET", imgtags[i].dataset.src , true);
  ////   myLocalXHR.send();
  ////   
     //link.image="https://www.google.com/s2/favicons?domain="+tmpurl.hostname 
     //let testurls=[ "https://favicon.splitbee.io/?url="+tmpurl.hostname ,  ]
     //"https://favicon.splitbee.io/?url="+tmpurl.hostname 
     let testurls=[ "https://thick-lamb-61.deno.dev/favicon/"+tmpurl.hostname ,"https://favicon.yandex.net/favicon/"+tmpurl.hostname  ]
     let returnimg="notfound"
     //let fallbackimg="data:image/svg+xml;charset=UTF-8,%3csvg aria-hidden='true' data-prefix='fal' data-icon='globe-africa' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512' class='svg-inline--fa fa-globe-africa fa-w-16 fa-7x'%3e%3cpath fill='currentColor' d='M248 8C111.04 8 0 119.03 0 256s111.04 248 248 248 248-111.03 248-248S384.96 8 248 8zm193.21 152H423.5c-17.38 0-31.5 14.12-31.5 31.5l.28 6.47-12.62 6.69c-2.66.48-8.41.66-15.09.97-32.31 1.52-46.88 2.67-52.91 14.61l-4 10.12 18.44 27.61A31.427 31.427 0 0 0 352.29 272l7.72-.5.09 11.02-18.81 25.09a31.937 31.937 0 0 0-5.66 12.97l-4.19 22.56c-10.38 9.5-19.62 20.3-27.47 32.08l-13.03 19.53c-4.66 6.98-16.53 6.33-20.28-1.28a62.926 62.926 0 0 1-6.66-28.09V335.5c0-17.38-14.12-31.5-31.5-31.5h-25.88c-10.31 0-20-4.02-27.31-11.31-7.28-7.3-11.31-17-11.31-27.31v-14.06c0-12.09 5.78-23.66 15.44-30.91l27.62-20.69c10.94-8.27 27.72-10.42 41.31-3.64l14.72 7.36c7.5 3.73 16.03 4.38 24.06 1.7l47.31-15.77a31.466 31.466 0 0 0 21.53-29.88c0-17.38-14.12-31.5-31.5-31.5l-9.72.16-6.94-6.94c-5.94-5.94-13.84-9.22-22.25-9.22l-89.58.51-.38-3.92 14.44-3.61c7.66-1.91 14.25-6.56 18.56-13.06L240.28 80h24.22c17.38 0 31.5-14.12 31.5-31.5v-2.94C359.74 60.1 412.7 102.86 441.21 160zM248 472c-119.1 0-216-96.9-216-216S128.9 40 248 40c5.54 0 10.96.42 16.39.83l.11 7.17h-24.22c-10.53 0-20.34 5.25-26.19 14.02l-7.78 11.92-14.47 3.61C177.81 81.08 168 93.64 168 108.09v4.41c0 17.38 14.12 31.5 31.5 31.5l89.72-.16 6.94 6.94c5.94 5.95 13.84 9.22 22.25 9.22l9.94-.97-46.94 15.78-14.72-7.36c-22.34-11.17-53.38-9.5-74.84 6.67l-27.59 20.69c-17.7 13.27-28.26 34.39-28.26 56.5v14.06c0 18.86 7.34 36.59 20.69 49.94S187.75 336 206.62 336l25.38-.5v29.88c0 14.69 3.47 29.38 10.03 42.42 7.44 14.92 22.44 24.2 39.12 24.2 14.66 0 28.25-7.28 36.41-19.48l13.03-19.55c6.44-9.64 14-18.47 22.41-26.17 5.09-4.62 8.47-10.66 9.75-17.45l4.22-22.62 18.75-25c4.06-5.42 6.28-12.12 6.28-18.89V271.5c0-17.38-14.12-31.5-31.5-31.5l-7.78.2-1.22-1.83c5.38-.34 10.81-.61 14.53-.78 15.88-.73 20.66-1.05 25.16-3.3l15.41-7.7c10.75-5.38 17.41-16.17 17.41-28.17l-.5-6.42h30.81c6.29 20.23 9.69 41.73 9.69 64C464 375.1 367.1 472 248 472z' class=''%3e%3c/path%3e%3c/svg%3e"
     let fallbackimg="https://t"+Math.round(Math.random()*20%3)+".gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://"+tmpurl.hostname+"&size=64"
     logtty("starting")
     let randurl=testurls[(Math.floor(Math.random() * testurls.length))]
     for (const testurl of [randurl]) {
      try {
        //logtty("trying"+testurl)
        //let fav = await fetch(testurl)
         fetch(testurl)
          .then((fav) => { 
            console.log(fav); 
            if ((fav.status === 200||fav.status==201||fav.status==204)) { 
              let favct = fav.headers.get('content-type')
              if(!(favct.includes('application')&&!(favct.includes('text')))) {
                 return fav.blob() }   else { return false; }
            }   else { return false; }
          })
          .then((myBlob) => {
            if(myBlob) {
            const objectURL = URL.createObjectURL(myBlob);
            returnimg = objectURL;
            }
          });
        //console.log(fav)

        //if(fav && ("headers" in await fav)) {
        //  //logtty("headers found")
        //  let favct = await fav.headers.get('content-type')
        //  //https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/bookmark.svg
        //  console.log(fav.status)
        //  if ((fav.status === 200||fav.status==201||fav.status==204)) {
        //    console.log("fav status found")
        //      if(!(favct.includes('application')&&!(favct.includes('text')))) {
        //        var dsrc=await window.URL.createObjectURL(fav);
        //        returnimg=dsrc;
        //      }
        //  }
        //}
      
        } catch (e) {
        console.log( e)
        }
        }
        if(returnimg=="notfound") {
          link.image=fallbackimg
        } else {
          link.img=returnimg
        }
     
      
     
    }
  if (!isURL(link.url)) return <div></div>

  return (
    <div className='mb-4'>
      <a href={link.url} className='no-underline gistmark-link' target='_blank'>
        <div className='p-2 bg-white flex items-center rounded-md shadow-md hover:scale-105 transition transform duration-500 cursor-pointer'>
          <div className=''>
            <Image src={link.image} className='gistmark-image w-24 h-24 object-cover max-w-none' rounded />
          </div>
          <div className=' px-2'>
            <h2 className='text-sm font-bold text-gray-700 break-all mb-0'>
              {link.title || link.url}
            </h2>
            <p className='text-gray-400 text-xs mb-1'>{new URL(link.url).hostname}</p>
            <p className='text-gray-600 text-xs'>{truncateString(link.description || '', 80)}</p>
            <span className='text-gray-600 text-xs'>{truncateString(link.category || '', 90)}</span>
          </div>
        </div>
      </a>
    </div>
  )
}
