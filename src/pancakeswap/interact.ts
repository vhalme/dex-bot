import { ethers } from 'ethers'
import bep20Abi from './contracts/BEP20.json'
import pancakeRouterAbi from './contracts/PancakeRouter.json'

interface TokenMap {
    [key: string]: string
}

export async function pumpOrDump(token1: string, token2: string, action: string) {

    const { PRIVATE_KEY } = process.env

    if (!PRIVATE_KEY) {
        console.log('Private key missing from env variables')
        return
    }
    
    const tokenMap: TokenMap = {
        'WBNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        'ACH': '0xBc7d6B50616989655AfD682fb42743507003056D'
    }

    const pancakeRouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

    // Connect to the BSC mainnet
    const provider = new ethers.providers.JsonRpcProvider(
        'https://bsc-dataseed.binance.org/'
    );

    // Sign the transaction with the contract owner's private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Get the contract instance
    const pancakeRouterContract = new ethers.Contract(pancakeRouterAddress, pancakeRouterAbi, wallet)

    const token1Address = tokenMap[token1] || token1
    const token2Address = tokenMap[token2] || token2

    const token1Contract = new ethers.Contract(token1Address, bep20Abi, wallet)
    const token2Contract = new ethers.Contract(token2Address, bep20Abi, wallet)

    const providedGasPrice = await provider.getGasPrice()
    const gasPrice = ethers.BigNumber.from(providedGasPrice.toNumber() * 1.2)

    const walletAddress = await wallet.getAddress()
    const walletBalance = await wallet.getBalance()

    const token1Balance: ethers.BigNumber = await token1Contract.balanceOf(walletAddress)
    const token2Balance: ethers.BigNumber = await token2Contract.balanceOf(walletAddress)

    console.log(walletAddress + ':', walletBalance.toBigInt())
    console.log('TOKEN1:', token1Balance.toBigInt(), 'TOKEN2:', token2Balance.toBigInt())
    console.log('GAS PRICE:', gasPrice.toNumber())

    const expirationTimestamp = Math.floor((Date.now() / 1000) + (60 * 60))
        
    let fromContract = token2Contract
    let fromAddress = token2Address
    let toAddress = token1Address
    let amount = token2Balance
    if (action === 'pump') {
        fromContract = token1Contract
        fromAddress = token1Address
        toAddress = token2Address
        amount = token1Balance
    }

    const allowance: ethers.BigNumber = await fromContract.allowance(walletAddress, pancakeRouterAddress)
    console.log(`ALLOWANCE: ${allowance.toBigInt()}`)
    if (allowance.lt(amount)) {
        const approvalResult = await fromContract.approve(pancakeRouterAddress, amount)
        console.log(`Spending of ${amount.toBigInt()} approved.`)
    }

    const txInputs = [
        amount,
        0,
        [ fromAddress, toAddress ],
        walletAddress, 
        expirationTimestamp 
    ]

    let gasLimit = ethers.BigNumber.from(500000)
    
    try {
        const gasEstimate = await pancakeRouterContract.estimateGas.swapExactTokensForTokens(...txInputs)
        gasLimit = ethers.BigNumber.from(gasEstimate.toNumber() * 3)
        console.log(`GAS LIMIT: ${gasLimit.toNumber()}/${gasEstimate.toNumber()}`)
    } catch (error) {
        console.log(`DEFAULT GAS LIMIT: ${gasLimit.toNumber()}`)
    }
    
    console.log(`GAS PRICE: ${gasPrice.toNumber()}/${providedGasPrice}`)
    
    const result = await pancakeRouterContract.swapExactTokensForTokens(...txInputs, { gasPrice, gasLimit })

    return result

}

