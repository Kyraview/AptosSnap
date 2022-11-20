import { OnRpcRequestHandler } from '@metamask/snap-types';
import {AptosAccount, AptosClient, CoinClient, FaucetClient} from 'aptos'
import { getAccount } from './Wallet/Accounts';
import {transferParams} from './Utils/interfaces';
import { HexString } from 'aptos';
import { NetworkRequest } from './Utils/networkClient';
import { WalletFuncs } from './Wallet/WalletFuncs';

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {

  const devNetFaucetUrl = "https://faucet.devnet.aptoslabs.com";
  
  

  const userAccount = await getAccount(2);
  const walletfunctions = new WalletFuncs(userAccount, "devnet")

  switch (request.method) {
    case 'getAddress':
      return userAccount.address().toString();
    case 'fund':
      await fetch(devNetFaucetUrl+"/mint"+"?address="+HexString.ensure(userAccount.address().toString()).noPrefix()+"&amount=10000000", {method:"post"})
      return true;
    case 'getBalance':
      return await walletfunctions.getAptosBalance()
      
    case 'transfer':
      const params = request.params as unknown as transferParams;
      let toAccount =  params.to
      let Amount = BigInt(params.amount);
      const output = await walletfunctions.transfer(toAccount, Amount);
      return output
      
    default:
      throw new Error('Method not found.');
  }
};
