
import { AptosAccount } from "aptos";
import { SimpleClient } from "../Utils/SimpleClient";
import { TransactionBuilderEd25519 } from 'aptos';
import { TxnBuilderTypes } from "aptos";
import {TransactionCreator} from '../Utils/TransactionCreator'
import { Metamask } from "../Utils/Metamask";
const nacl = require('tweetnacl')

export class WalletFuncs{
    account: AptosAccount;
    client: SimpleClient;
    txnSigner: TransactionBuilderEd25519;
    txnCreator: TransactionCreator;
    network: "mainnet" | "testnet" | "devnet";

    constructor(account:AptosAccount, network:"mainnet" | "testnet" | "devnet"){
        this.account = account;
        this.client = new SimpleClient(network);
        this.txnCreator = new TransactionCreator(this.client);
        this.network = network;
        this.txnSigner = WalletFuncs.getSigner(account);
    }

    static getSigner(account: AptosAccount){
        return new TransactionBuilderEd25519((signingMessage: TxnBuilderTypes.SigningMessage) => {
            // @ts-ignore
            const sigHexStr = account.signBuffer(signingMessage);
            return new TxnBuilderTypes.Ed25519Signature(sigHexStr.toUint8Array());
          }, account.pubKey().toUint8Array());

    }

    async transfer(address: string, amount: bigint | string | number){
        amount = BigInt(amount);
        console.log("here")
        const confirm = await Metamask.sendConfirmation("send Transaction?", this.network, `Would you like to send ${amount.toString()} to address`);
        if(!confirm){
            return Metamask.throwError(4300, "user rejected request")
        }
        console.log("passed confirm");
        const payload = TransactionCreator.buildTransferPayload(address, amount);
        console.log("passed payload creation")
        const rawTransferTxn = await this.txnCreator.buildRawTransactionFromPayload(this.account, payload);
        console.log("passed raw transaction creation")
        const sig = this.txnSigner.sign(rawTransferTxn)
        console.log("passed signature")
        return await this.client.postTxn(sig);
    }

    async getAptosBalance() : Promise<string>{
        const coin = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        const address = this.account.address().toString();
        return await this.client.getBalance(address, coin);
    }
}