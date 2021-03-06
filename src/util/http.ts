export function combineUrlAndParams(url: string, params: {[key: string]: string}) {
  let query = Object.keys(params).map(
    k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
  ).join('&');

  if (query) {
    if (url.indexOf('?') >= 0) {
      return url + '&' + query;
    } else {
      return url + '?' + query;
    }
  }
  return url;
}
