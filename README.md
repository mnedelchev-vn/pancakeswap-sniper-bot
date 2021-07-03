![alt text](https://github.com/mnedelchev-vn/pancakeswap-sniper-bot/blob/main/pancakeswap-sniper-bot.png)

# PancakeSwap sniper bot

## Purpose
This bot allows you to compete with other trading bots when buying a cryptocurrency. Can be used for fairlaunches or if you've been unlucky and not being whitelisted for the private or public sales and you still want to buy immediately on PancakeSwap pair creation. If a project is hype it is quite impossible to compete manually with bots. For long time bots have been integral part of trading not only for the cryptocurrencies, but also for stocks, fiat currencies, etc.

## Features
* Has the option to work with both BSC mainnet and testnet
* Including all kind of transaction options like gas price, gas limit, transaction slippage, transaction deadline, etc
* Has the option to fire multiple transactions at once
* Supporting milliseconds
* Free

## Requirements
* npm 6.0.0 or above
* NodeJS 10.0.0 or above
* pm2

## Installation
Clone this repository ( or download from Code -> Download ZIP ) and run `npm install` inside the project folder. This command will download all the needed libraries which the bot needs to work properly.

## Usage
You can run the script using `node` or `pm2` commands. I personally like to use the `pm2` command on my server, because PM2 is a process manager which takes care for my script to run 24/7. 

#### Required parameters:
* `tokenAddress` - this is the contract address of the token you're willing to buy. String, 42 bytes size starting with `0x`.
* `buyingBnbAmount` - this is the amount of BNB which you are willing to use to execute the buying transaction. Integer or float.
* `senderPrivateKey` - this is the private key of the wallet address which will be used to execute the buying transaction. String, 66 bytes size starting with `0x`.

#### Optional parameters:
* `gasLimit` - the maximum amount of gas you are willing to consume on a transaction, default value is 300000.
* `gasPrice` - the transaction gas price in Gwei, default value is 10 Gwei.
* `transactionIterations` - how many times you want the transaction to be executed. Some fairlaunches have smart contract conditions to not buy big amounts of tokens for single transaction, so in the case that you want to buy bigger amount and to bypass the contract condition you can execute many transactions buying same amount. Setting `transactionIterations` to 3 will execute 3 different buying transactions with the same transaction parameters. Default value is 1.
* `transactionSlippage` - the difference ( in percents ) between the expected price of a trade and the executed price of that trade. Default value is 15 percents, integer.
* `transactionDeadline` - your transaction will revert if it is pending for more than this long. Default value is 1200 seconds, integer.
* `bscNetwork` - accepts only `'mainnet'` and `'testnet'` values. Defines to which network should the bot submit blockchain transactions. Default value is `'testnet'`.
* `createLogs` - boolean, if set to `true` it will create ./logs folder and save logs on different bot actions.
* `cronTime` - how often should the bot try to buy the particular token. Default is `'*/100 * * * * * *'` aka every 100 milliseconds.
* `botInitialDelay` - by default when starting the bot for first time it has 10 seconds delay to double check what parameters have been passed. Setting this parameters to `0` will remove the delay if needed.

#### Sample terminal command:
* Using `node` - `node pancakeswap-sniper-bot.js -- tokenAddress=0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51 buyingBnbAmount=1.05 senderPrivateKey=0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f createLogs=true gasPrice=25 transactionSlippage=30 bscNetwork=mainnet`
* Using `pm2` - `pm2 start pancakeswap-sniper-bot.js -- tokenAddress=0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51 buyingBnbAmount=1.05 senderPrivateKey=0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f createLogs=true gasPrice=25 transactionSlippage=30 bscNetwork=mainnet`

If you wish to use the bot at same time for multiple crypto tokens you could make several pm2 instances by passing `--name` parameter to the pm2 command. Example: `--name "app name"`.