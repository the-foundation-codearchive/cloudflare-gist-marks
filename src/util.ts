export const getParam = (name: string) => {
  const url = new URL(location.toString())
  return url.searchParams.get(name)
}

export const removeParam = () => {
  const url = new URL(location.toString())
  url.searchParams.delete('url')
  history.replaceState(null, '', url)
}

export const truncateString = (str: string, length: number) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length - 3) + '...' : str
}

export const isURL = (url: string): boolean => {
  const regexp = /^https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/
  const match = url.match(regexp)
  return match !== null
}

export const makeKey = async (url: string): string => {
  //dateInMillisecs = Date.now();
  //dateInSecs = Math.round(dateInMillisecs / 1000);
  //const hash = 99999999999999 - new Date().getTime()
  const myText = new TextEncoder().encode(url);
  const myDigest = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    myText // The data you want to hash as an ArrayBuffer
  );
  //console.log(new Uint8Array(myDigest));
  digtxt=new TextDecoder().decode(new Uint8Array(myDigest));
  const hash=truncateString(digtxt,12)+Date.now();
  return  `${hash}`
}
