// gistmarks.js

//var boot_endpoint="https:\/\/comments.thefoundation.cloudns.ph\/ping"
//function pingBoot() {
//    const xmlhttp = new XMLHttpRequest();
//    xmlhttp.onreadystatechange = function() {
//      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//       console.log("boot.status: " + xmlhttp.responseText);
//      }
//      if (xmlhttp.readyState == 4 && xmlhttp.status != 200)  { console.log("boot.status: FAILED");  }
//    }
//    xmlhttp.open("GET", boot_endpoint , true);
//    xmlhttp.send();
//  }
//function pingBootTrigger() { setTimeout(pingBoot,1);  }

function touchScreenDetected() {
   return ("ontouchstart" in document.documentElement);
  }
  
  function mobileUserAgentDetected() {
      const toMatch = [
          /Android/i,
          /Skyfire\//i,
          /TeaShark\//i,
          /Teleca /i,
          /uZardWeb/i,
          /BlackBerry/i,
          /MOT-L/i,
          /R MIB\//i,
          /Nokia/i,
          /Symbian/i,
          /Doris/i,
          /Dorothy/i,
          /Fennec/i,
          /Iris/i,
          /Minimo/i,
          /Kindle/i,
          /SAMSUNG/i,
          /SonyEriccson/i,
          /NetFront\//i,
          /Android/i,
          /webOS/i,
          /iPhone/i,
          /iPad/i,
          /iPod/i,
          /PalmSource/i,
          /BOLT\//i,
          /Windows Phone/i,
          /IEMobile/i,
          /Windows Phone/i,
          /Opera Mini/i,
          /Opera Mobi/i,
          /Windows Phone/i
  
      ];
  
      return toMatch.some((toMatchItem) => {
          return navigator.userAgent.match(toMatchItem);
      });
  }
  function mobileScreenDetected() {
       if ( ( window.innerWidth >= 800 )
       
           ) {
         return false;
       } else { return true; };
     }
  if(mobileUserAgentDetected()||mobileScreenDetected()) { document.getElementById("statusdisplay").style.height="160px" }

  let timeout;
//   
//   function lazyLoader() {
//   if( mobileScreenDetected() || touchScreenDetected() || mobileUserAgentDetected()  ) {
//     var lazyBlockers="";
//     if(mobileScreenDetected())     { lazyBlockers="small_res_screen"; }
//     if(touchScreenDetected())      { lazyBlockers=lazyBlockers+" touchScreenDetected"; }
//     if(mobileUserAgentDetected())  { lazyBlockers=lazyBlockers+" mobileUserAgentDetected"; }
//     console.log("lazy_loader not starting ... reason:" + lazyBlockers)
//     } else {
//     console.log("lazy_loader started!");
//     const imgtags=document.getElementsByTagName("img");
//     
//     for (var i = 0; i < imgtags.length; i++) {
//       if ( imgtags[i].dataset.src != undefined && imgtags[i].dataset.src != imgtags[i].src ) {
//         console.log("queuing lazy img #"+i+" : "+imgtags[i].dataset.src);
//   
//         myLocalXHR = new XMLHttpRequest();
//         myLocalXHR.imgtag=imgtags[i];
//         myLocalXHR.responseType = 'blob';
//         myLocalXHR.sourceURL=imgtags[i].dataset.src;
//         myLocalXHR.onreadystatechange = function() {
//             var imgtag , sourceURL;
//             if (this.readyState == 4 && this.status == 200) {
//                
//                
//                
//                
//                console.log("replacing "+this.sourceURL+"type "+this.getResponseHeader('content-type'));
//                var tmpurl=window.URL.createObjectURL(this.response);
//                this.imgtag.src=tmpurl;
//                this.imgtag.dataset.src=tmpurl
//             }
//         };
//         myLocalXHR.open("GET", imgtags[i].dataset.src , true);
//         myLocalXHR.send();
//         
//       }
//     }
//   }
//   }
//   
//   function startLazyLoader() {
//     timeout = setTimeout(lazyLoader, 23 );
//   }
//   
//   startLazyLoader();
   
   