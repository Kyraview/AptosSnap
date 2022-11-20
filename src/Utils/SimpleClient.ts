import { NetworkRequest } from "./networkClient";
import { HexString } from "aptos";


export class SimpleClient{

    baseURL: string;
    network: "mainnet" | "testnet" | "devnet";
    networks;
    constructor(network: "mainnet" | "testnet" | "devnet"){
        this.networks = {
            "mainnet": {url:"https://fullnode.mainnet.aptoslabs.com/v1", id:1},
            "testnet": {url:"https://fullnode.testnet.aptoslabs.com/v1", id:2},
            "devnet": {url:"https://fullnode.devnet.aptoslabs.com/v1", id:null}
        }
        this.baseURL = this.networks[network].url;
        this.network = network;
    }

    async getSequenceNumber(address:HexString) : Promise<bigint>{
        console.log("here");
        const formattedAddress : string = address.toString().slice(2);
        const backString = `/accounts/${formattedAddress}`;
        const jsonOutput = (await NetworkRequest.get(this.baseURL+backString));
        console.log(jsonOutput);
        const sequenceNumber = jsonOutput.sequence_number;
        console.log(sequenceNumber);
        return BigInt(sequenceNumber);
    }

    async getGasEstimate(priority?: 'low' | 'avg' | 'high') : Promise<bigint>{
        const backString = '/estimate_gas_price'
        let key;
        if(priority === 'low'){
           key =  "deprioritized_gas_estimate";
        }
        else if(priority === 'high'){
            key = "prioritized_gas_estimate";
        }
        else{
            key = "gas_estimate";
        }
        let jsonOutput = await NetworkRequest.get(this.baseURL+backString)
        console.log(jsonOutput);
        console.log(key)
        return BigInt(jsonOutput[key])
    }

    async getChainId(): Promise<number>{
        if(this.network === "devnet"){
            return (await NetworkRequest.get(this.baseURL)).chain_id
        }
        return this.networks[this.network].id
    }

    async getBalance(address: string, coin: string): Promise<string>{
        address = address.slice(2);
        return (await NetworkRequest.get(`${this.baseURL}/accounts/${address}/resource/${coin}`)).data.coin.value;
    }
    
    async postTxn(txn: Uint8Array){
        console.log("inside post Txn");
        const json = await NetworkRequest.postBytes(this.baseURL+"/transactions", txn);
        console.log("done posting");
        return json;
    }
}