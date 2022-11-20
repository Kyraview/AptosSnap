import {Url} from 'url'


export class NetworkRequest{
    static async get(baseUrl:string, query?){
        let queryString;
        const url = new URL(baseUrl)
        if(typeof query === 'object'){
            for(let key in query){
                url.searchParams.append(key, query[key])
            }
        }
        const request = await fetch(url.toString());
        return request.json();
    }

    static async postBytes(url, data: Uint8Array){
        console.log("inside postBytes")
        const options = {
            method: "post",
            headers: {'content-type': 'application/x.aptos.signed_transaction+bcs'},
            body: data
        };
        console.log("options configured")
        
        const request = await fetch(url, options);
        console.log("submitted");
        const outputJSON = request.json()
        console.log(outputJSON);
        return outputJSON;
        
    }
}