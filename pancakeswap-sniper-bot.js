#!/usr/bin/ nodejs
const fs = require('fs');
const Cronr = require('cronr');
const Web3 = require('web3');

console.log('Welcome to PancakeSwap Sniper bot!');

// ======================== DEFAULT CONFIG ========================
var bscNetwork = 'testnet';
var allowedNetworks = ['testnet', 'mainnet'];
var gasLimit = 500000;
var gasPrice = 10; // in gwei
var transactionIterations = 1;
var executed = 0;
var transactionSlippage = 15; // in percents
var transactionDeadline = 1200; // in seconds
var createLogs = false;
var cronTime = '*/100 * * * * * *'; // every 10 milliseconds
var botInitialDelay = 10000;
// ======================== /DEFAULT CONFIG ========================

var logsDir = __dirname + '/logs/';
var logsPath = logsDir + new Date().toISOString().slice(0,10) + '.txt';

const projectData = {
    utils: {
        createLog: function(content) {
            if (createLogs) {
                console.log(content);
                if (fs.existsSync(logsPath)) {
                    content = '\r\n' + new Date().toUTCString() + ': ' + content;
                }
                fs.appendFile(logsPath, content, function (err) {
                    if (err) throw err;
                });
            }
        },
        propertyExists: function(object, key) {
            return object ? hasOwnProperty.call(object, key) : false;
        }
    }
};

// reading params
var params = process.argv.slice(2);
var args = {};
for (var i = 0, len = params.length; i < len; i+=1) {
    var key_value = params[i].split('=');
    args[key_value[0]] = key_value[1];
}

function initPancakeswapSniperBot() {
    bscNetwork = (projectData.utils.propertyExists(args, 'bscNetwork') && allowedNetworks.includes(args.bscNetwork)) ? args.bscNetwork : bscNetwork;
    if (bscNetwork == 'mainnet') {
        var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
        var pancakeContractAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
        var wbnbAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
        var chainId = 56;
    } else if (bscNetwork == 'testnet') {
        var web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545'));
        var pancakeContractAddress = '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3';
        var wbnbAddress = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
        var chainId = 97;
    }

// ======================== REQUIRED PARAMETERS ========================
    if (!projectData.utils.propertyExists(args, 'tokenAddress') || args.tokenAddress == '' || args.tokenAddress == null || args.tokenAddress == undefined || args.tokenAddress.length != 42) {
        return console.error('Missing or wrong tokenAddress parameter.');
    } else if (!projectData.utils.propertyExists(args, 'buyingBnbAmount') || args.buyingBnbAmount == '' || args.buyingBnbAmount == null || args.buyingBnbAmount == undefined) {
        return console.error('Missing or wrong buyingBnbAmount parameter.');
    } else if (!projectData.utils.propertyExists(args, 'senderPrivateKey') || args.senderPrivateKey == '' || args.senderPrivateKey == null || args.senderPrivateKey == undefined || args.senderPrivateKey.length != 66) {
        return console.error('Missing or wrong senderPrivateKey parameter.');
    }

    var buyingBnbAmount = args.buyingBnbAmount;
    var tokenAddress = args.tokenAddress;
    var senderPrivateKey = args.senderPrivateKey;
    var senderAddress = web3.eth.accounts.privateKeyToAccount(senderPrivateKey).address;
    // ======================== /REQUIRED PARAMETERS ========================

    // ======================== CHANGING DEFAULT PARAMETERS IF THEY ARE PASSED ========================
    console.log('Address used to send the transactions: ' + senderAddress);
    console.log('BSC network: ' + bscNetwork);
    gasLimit = (projectData.utils.propertyExists(args, 'gasLimit') && args.gasLimit != '' && args.gasLimit != null && args.gasLimit != undefined) ? args.gasLimit : gasLimit;
    console.log('Gas limit: ' + gasLimit);
    gasPrice = (projectData.utils.propertyExists(args, 'gasPrice') && args.gasPrice != '' && args.gasPrice != null && args.gasPrice != undefined) ? args.gasPrice * 1000000000 : gasPrice * 1000000000;
    console.log('Gas price: ' + (gasPrice / 1000000000) + ' Gwei');
    transactionIterations = (projectData.utils.propertyExists(args, 'transactionIterations') && args.transactionIterations != '' && args.transactionIterations != null && args.transactionIterations != undefined) ? args.transactionIterations : transactionIterations;
    console.log('Transaction iterations: ' + transactionIterations);
    transactionSlippage = (projectData.utils.propertyExists(args, 'transactionSlippage') && args.transactionSlippage != '' && args.transactionSlippage != null && args.transactionSlippage != undefined) ? args.transactionSlippage : transactionSlippage;
    console.log('Transaction slippage: ' + transactionSlippage);
    transactionDeadline = (projectData.utils.propertyExists(args, 'transactionDeadline') && args.transactionDeadline != '' && args.transactionDeadline != null && args.transactionDeadline != undefined) ? args.transactionDeadline : transactionDeadline;
    console.log('Transaction deadline: ' + transactionDeadline);
    createLogs = (projectData.utils.propertyExists(args, 'createLogs') && args.createLogs === 'true') ? true : createLogs;
    console.log('Creating logs: ' + createLogs);
    cronTime = (projectData.utils.propertyExists(args, 'cronTime') && args.cronTime != '' && args.cronTime != null && args.cronTime != undefined) ? args.cronTime : cronTime;
    console.log('Cron time: ' + cronTime);
    botInitialDelay = (projectData.utils.propertyExists(args, 'botInitialDelay') && args.botInitialDelay != '' && args.botInitialDelay != null && args.botInitialDelay != undefined) ? args.botInitialDelay : botInitialDelay;
    console.log('Bot initial delay: ' + botInitialDelay);
// ======================== /CHANGING DEFAULT PARAMETERS IF THEY ARE PASSED ========================

// if logs dir missing then create it
    if (createLogs && !fs.existsSync(logsDir)){
        fs.mkdirSync(logsDir);
    }

    var pancakeContractABI = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExeactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
    var pancakeContract = new web3.eth.Contract(pancakeContractABI, pancakeContractAddress);

    if (botInitialDelay > 0) {
        console.log('Starting the PancakeSwap Sniper bot in ' + (botInitialDelay / 1000) + ' seconds... ¯\\_(*o*)_/¯');
    } else {
        console.log('Starting the PancakeSwap Sniper bot now... ¯\\_(*o*)_/¯');
    }

    setTimeout(function () {
        var executeBuy = true;
        // check if sender has enough balance
        web3.eth.getBalance(senderAddress, function (getBalanceErr, getBalanceResponse) {
            if (!getBalanceErr) {
                if (BigInt(web3.utils.toWei(buyingBnbAmount, 'ether')) < BigInt(getBalanceResponse)) {
                    // check if token address is a contract address
                    web3.eth.getCode(tokenAddress, function (getCodeErr, getCodeResponse) {
                        if (!getCodeErr) {
                            if (getCodeResponse != '0x') {
                                // take the current nonce of the sender
                                web3.eth.getTransactionCount(senderAddress, 'pending', function (nonceErr, nonceResponse) {
                                    var nonce = nonceResponse;
                                    var txParams = {
                                        gas: web3.utils.toHex(gasLimit),
                                        gasPrice: web3.utils.toHex(gasPrice),
                                        nonce: web3.utils.toHex(nonce),
                                        chainId: chainId,
                                        value: web3.utils.toHex(web3.utils.toWei(buyingBnbAmount, 'ether')),
                                        to: pancakeContractAddress
                                    };

                                    const job = new Cronr(cronTime, function() {
                                        projectData.utils.createLog('Cronjob iteration.');
                                        if (executeBuy) {
                                            executeBuy = false;

                                            return executeTransaction(executed);
                                            function executeTransaction(executed) {
                                                pancakeContract.methods.getAmountsOut(web3.utils.toWei(buyingBnbAmount, 'ether'), [wbnbAddress, tokenAddress]).call({}, function(amountsOutError, amountsOutResult)   {
                                                    if (!amountsOutError) {
                                                        var amountOut = amountsOutResult[1];
                                                        if (amountOut > 0) {
                                                            amountOut = amountOut - (amountOut * transactionSlippage / 100);
                                                            projectData.utils.createLog('Trading pair is active.');

                                                            amountOut = BigInt(Math.round(amountOut));
                                                            amountOut = amountOut.toString();

                                                            // check if swap transaction is going to succeed or fail
                                                            pancakeContract.methods.swapExactETHForTokens(amountOut, [wbnbAddress, tokenAddress], senderAddress, Math.round(new Date(new Date().getTime() + (transactionDeadline * 1000)).getTime() / 1000)).estimateGas({from: senderAddress, gas: gasLimit, value: web3.utils.toHex(web3.utils.toWei(buyingBnbAmount, 'ether'))}, function(gasEstimateError, gasAmount) {
                                                                if (!gasEstimateError) {
                                                                    projectData.utils.createLog('Method executeTransaction, params: {executed: ' + executed  + ',  amountOut: ' + amountOut  + ', wbnbAddress: ' + wbnbAddress  + ', tokenAddress: ' + tokenAddress  + ', senderAddress: ' + senderAddress + '}');
                                                                    txParams.data = pancakeContract.methods.swapExactETHForTokens(amountOut, [wbnbAddress, tokenAddress], senderAddress, Math.round(new Date(new Date().getTime() + (transactionDeadline * 1000)).getTime() / 1000)).encodeABI();

                                                                    web3.eth.accounts.signTransaction(txParams, senderPrivateKey, function (signTransactionErr, signedTx) {
                                                                        if (!signTransactionErr) {
                                                                            nonce += 1;
                                                                            txParams.nonce = web3.utils.toHex(nonce);

                                                                            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (sendSignedTransactionErr, transactionHash) {
                                                                                if (!sendSignedTransactionErr) {
                                                                                    executed += 1;

                                                                                    if (transactionIterations != 1) {
                                                                                        projectData.utils.createLog('Buying order N: ' + executed + '. Transaction hash: ' + transactionHash);
                                                                                        if (transactionIterations != executed) {
                                                                                            return executeTransaction(executed);
                                                                                        } else {
                                                                                            job.stop();
                                                                                        }
                                                                                    } else {
                                                                                        projectData.utils.createLog('First and only buying order. Transaction hash: ' + transactionHash)
                                                                                        job.stop();
                                                                                    }
                                                                                } else {
                                                                                    executeBuy = true;
                                                                                    if (sendSignedTransactionErr.message) {
                                                                                        projectData.utils.createLog('Method web3.eth.sendSignedTransaction failed. Message: ' + sendSignedTransactionErr.message);
                                                                                    } else {
                                                                                        projectData.utils.createLog('Method web3.eth.sendSignedTransaction failed. Message: ' + sendSignedTransactionErr.toString());
                                                                                    }
                                                                                }
                                                                            });
                                                                        } else {
                                                                            executeBuy = true;
                                                                            if (signTransactionErr.message) {
                                                                                projectData.utils.createLog('Method web3.eth.accounts.signTransaction failed. Message: ' + signTransactionErr.message);
                                                                            } else {
                                                                                projectData.utils.createLog('Method web3.eth.accounts.signTransaction failed. Message: ' + signTransactionErr.toString());
                                                                            }
                                                                        }
                                                                    });
                                                                } else {
                                                                    executeBuy = true;
                                                                    if (gasEstimateError.message) {
                                                                        projectData.utils.createLog('Method pancakeContract.methods.swapExactETHForTokens.estimateGas() failed. Message: ' + gasEstimateError.message);
                                                                    } else {
                                                                        projectData.utils.createLog('Method pancakeContract.methods.swapExactETHForTokens.estimateGas() failed. Message: ' + gasEstimateError.toString());
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            executeBuy = true;
                                                            projectData.utils.createLog('Trading pair active. amountOut smaller or equal to 0.');
                                                        }
                                                    } else {
                                                        executeBuy = true;
                                                        projectData.utils.createLog('Trading pair not active yet.');
                                                    }
                                                });
                                            }
                                        }
                                    }, {});
                                    job.start();
                                });
                            } else {
                                projectData.utils.createLog('Invalid tokenAddress parameter. tokenAddress must be contract address.');
                                return false;
                            }
                        } else {
                            projectData.utils.createLog('Reading token address code failed.');
                            return false;
                        }
                    });
                } else {
                    executeBuy = true;
                    projectData.utils.createLog('Sender address does not have enough BNB balance to execute the transaction. Current balance: ' + web3.utils.fromWei(getBalanceResponse.toString(), 'ether') + ' BNB.');
                    return false;
                }
            } else {
                projectData.utils.createLog('Reading sender address balance failed.');
                return false;
            }
        });
    }, botInitialDelay);
}
initPancakeswapSniperBot();