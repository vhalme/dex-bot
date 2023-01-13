import { ethers } from 'ethers'
import uniswapV3FactoryAbi from './contracts/UniswapV3Factory.json'
import uniswapV3PoolAbi from './contracts/UniswapV3Pool.json'

export async function quotePair() {

    const uniswapV3FactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
    const { PRIVATE_KEY } = process.env

    if (!PRIVATE_KEY) {
        console.log('Private key missing from env variables')
        return
    }
    
    // Connect to the BSC mainnet
    // const provider = ethers.getDefaultProvider();
    const provider = new ethers.providers.JsonRpcProvider(
        'https://polygon-rpc.com/'
    );

    // Sign the transaction with the contract owner's private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Get the contract instance
    const factoryContract = new ethers.Contract(uniswapV3FactoryAddress, uniswapV3FactoryAbi, wallet)

    const walletAddress = await wallet.getAddress()
    const walletBalance = await wallet.getBalance()

    console.log(walletAddress + ':', walletBalance.toBigInt())

    const tokenAAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // USDC
    const tokenBAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // WETH

    const txInputs = [
        tokenAAddress,
        tokenBAddress,
        3000
    ]

    const poolAddress = await factoryContract.getPool(...txInputs)
    console.log('Pool address:', poolAddress)

    const poolContract = new ethers.Contract(poolAddress, uniswapV3PoolAbi, wallet)
    const slot0 = await poolContract.slot0()
    
    const { tick } = slot0
    const tokenBPrice = 1 / ((1.0001 ** tick) * (10 ** -12))
    
    console.log('Tick:', tick, 'Price:', tokenBPrice)

    return tokenBPrice

}

