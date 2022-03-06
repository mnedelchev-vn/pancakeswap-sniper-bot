![alt text](https://github.com/mnedelchev-vn/pancakeswap-sniper-bot/blob/main/assets/images/pancakeswap-sniper-bot.png)

# PancakeSwap sniper bot

## Purpose
This bot helps you to compete with other trading bots or traders when buying a cryptocurrency on the [PancakeSwap DEX](https://pancakeswap.finance/). The bot can be used for fairlaunch ( stealthlaunch ) projects or if you just want to buy as fast as possible on PancakeSwap trading pair creation. If a project is hype and the community which is willing to buy the particular token is quite big, then it is close to impossible to compete manually with bots or traders. PancakeSwap, PooCoin, etc are known to have slow UX which will only make your buying transaction slower and in the end you might buy at not desired price. For long time bots have been integral part of trading not only for the cryptocurrencies, but also for stocks, fiat currencies, etc.

## Grateful users & support
This sniper bot is **fully free** and it was never meant to be paid. However if you appreciate my work I accept **BNB** or **ETH** donations at **0x5ADD71300d924213456b037b5be25020C62D9e08**. The real rockstars will follow my twitter as well:

[![Twitter URL](https://github.com/mnedelchev-vn/pancakeswap-sniper-bot/blob/main/assets/images/twitter.svg)](https://twitter.com/intent/follow?screen_name=mnedelchev_)

For people who have expressed their support through a donation I offer personal assistance in setting up the bot. *( contact me in [Twitter](https://twitter.com/intent/follow?screen_name=mnedelchev_) )*

## Features
* Operating with PancakeSwap: Router v2
* Has the option to work with both BSC mainnet and testnet
* Including all kind of transaction options like gas price, gas limit, transaction slippage, transaction deadline, etc
* Has the option to fire multiple transactions at once
* Supporting milliseconds
* Free

## Requirements
* npm 6.0.0 or above
* NodeJS 10.0.0 or above

## Installation
Clone this repository ( or download from Code -> Download ZIP ) and open your terminal inside the bot folder. Run `npm install` inside the bot folder. This command will download all the needed libraries which the bot needs to work properly. After the installation of the libraries is done then you're all set up to start sniping tokens!

## Usage
You can run the script using `node` or `pm2` commands. I personally like to use the `pm2` command on my server, because PM2 is a process manager which takes care for my script to run 24/7. *( but for the `pm2` option you need to own a virtual server )*

#### Required parameters:
* `tokenAddress` - this is the contract address of the token you're willing to buy. String, 42 bytes size starting with `0x`.
* `buyingBnbAmount` - this is the amount of BNB which you are willing to use to execute the buying transaction. Integer or float.
* `senderPrivateKey` - this is the private key of the wallet address which will be used to execute the buying transaction. String, 66 bytes size starting with `0x`.

#### Optional parameters:
* `node` - by default the bot will be using a standard BSC node. This node will be enough for signing transactions and sniping tokens, but however if you want be as fast as possible then you should find your self a fast node. When you're able to provide a node better than the standard one you can pass it as `node` parameter when starting the bot. The node has to be full URI to the RPC endpoint, example: `https://localhost:8545`.
* `gasLimit` - the maximum amount of gas you are willing to consume on a transaction, default value is 500 000. 
*( This value may not be sufficient in some cases, because some projects require more `gasLimit` in order for the tokens to be transferred. )*
* `gasPrice` - the transaction gas price in Gwei, default value is 10 Gwei. **( Something very important related to the transaction fee is that the address which is used to snipe should have the minimum of `gasLimit` * `gasPrice`(in wei) BNB balance to complete the transaction. Which means if the gasLimit is 500 000 and then gasPrice is 50 Gwei then we should have 500 000 * 0.00000005 = 0.025 BNB in our balance on top of the amount we placed in the `buyingBnbAmount` parameter. This does not mean that the 0.025 BNB will get spent, it's just how the validation before the transaction signing works. )**
* `transactionIterations` - how many times you want the transaction to be executed. Some fairlaunch projects have smart contract conditions to not buy big amounts of tokens for single transaction, so in the case that you want to buy bigger amount and to bypass the contract condition you can execute many transactions buying same amount. Setting `transactionIterations` to 3 will execute 3 different buying transactions with the same transaction parameters. Default value is 1.
* `transactionSlippage` - the difference ( in percents ) between the expected price of a trade and the executed price of that trade. Default value is 15 percents, integer.
* `transactionDeadline` - your transaction will revert if it is pending for more than this long. Default value is 1200 seconds, integer.
* `bscNetwork` - accepts only `mainnet` and `testnet` values. Defines to which network should the bot submit blockchain transactions. Default value is `testnet`.
* `createLogs` - boolean, if set to `true` it will create ./logs folder and save logs on different bot actions.
* `cronTime` - how often should the bot try to buy the particular token. Default is `*/100 * * * * * *` aka every 100 milliseconds.
* `botInitialDelay` - by default when starting the bot for first time it has 10 seconds delay to double check what parameters have been passed. Setting this parameter to `0` will remove the delay if needed.
* `explorerApiKey` - this parameter is the API key generated by [https://bscscan.com/apis](https://bscscan.com/apis). By passing this parameter the bot will only execute the buy transactions **only if** the contract is publicly verified on the blockchain explorer. The bot need this API key in order to make the request to the explorer API. **Warning** - for your own safety do not buy tokens with not verified smart contracts. It's very possible that this is a malicious contract.

#### Sample terminal command:
* Using `node` - `node pancakeswap-sniper-bot.js -- tokenAddress=0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51 buyingBnbAmount=1.05 senderPrivateKey=0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f createLogs=true gasPrice=25 transactionSlippage=30 bscNetwork=mainnet`
* Using `pm2` - `pm2 start pancakeswap-sniper-bot.js -- tokenAddress=0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51 buyingBnbAmount=1.05 senderPrivateKey=0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f createLogs=true gasPrice=25 transactionSlippage=30 bscNetwork=mainnet` *( This option is for people who are owners of virtual servers. By using pm2 you can start the bot on the virtual server and shut down your physical device. If you wish to use the bot at same time for multiple crypto tokens you could make several pm2 instances by passing `--name` parameter to the pm2 command. Example: `--name "app name"`. )*