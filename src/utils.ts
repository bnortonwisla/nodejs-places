export abstract class Utils {   
    
    public static requestInfo(request: { 'method': string, 'url': string, 'body': string}): string {
        return this.format(`Got a ${request.method} request.` + '<br>' 
        + 'URL: ' + request.url + '<br>' 
        + JSON.stringify(request.body, undefined, 4));
    };
  
    public static  format(str: string): string {
        return '<pre>' + str + '</pre>';
    };
  
    public static isMadisonArea(str: string): boolean {
        const first = str.slice(0, 6);
        return (first === "WI 535" || first === "WI 537"); 
    };
  
    public static randomPlace(data: any): any {
        const places = data.getData() as [];
        const randomIdx = Math.floor(Math.random() * (places.length + 1));
        return places[randomIdx];  
    };
  
    public static printJSON(item: any): string {
        return "<pre>" + JSON.stringify(item, undefined, 4) + "</pre>";
    };
}