import { BigNumber, Contract } from 'ethers'
import { DexWallet } from '../dexWallet'
import { callContractMethod } from '../contractUtils'
import { waitForTx } from '../networkUtils'
import erc20Abi from './contracts/ERC20.json'
import swapRouterAbi from './contracts/SwapRouter.json'

export async function swap(dexWallet: DexWallet, pair: [string, string], reverse?: boolean) {

    const {
        wallet,
        walletAddress,
        walletBalance,
        providerGasPrice
    } = dexWallet

    console.log(walletAddress + ':', walletBalance.toBigInt())

    const tokenAAddress = reverse ? pair[1] : pair[0]
    const tokenBAddress = reverse ? pair[0] : pair[1]
    const tokenAContract = new Contract(tokenAAddress, erc20Abi, wallet)
    const tokenBContract = new Contract(tokenBAddress, erc20Abi, wallet)

    const tokenABalance: BigNumber = await tokenAContract.balanceOf(walletAddress)
    const tokenBBalance: BigNumber = await tokenBContract.balanceOf(walletAddress)
    
    console.log('Token A', tokenABalance.toBigInt(), 'Token B:', tokenBBalance.toBigInt())

    const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
    const swapRouterContract = new Contract(swapRouterAddress, swapRouterAbi, wallet)
    
    console.log('Provider gas price:', providerGasPrice.toBigInt())
    const gasPrice: BigNumber = providerGasPrice.mul(12).div(10)
    console.log('  Actual gas price:', gasPrice.toBigInt())
    
    const allowance: BigNumber = await tokenAContract.allowance(walletAddress, swapRouterAddress)
    console.log('Token A spenditure allowance:', allowance.toBigInt())

    if (allowance.lt(tokenABalance)) {
        const approvalResult = await callContractMethod(tokenAContract, 'approve', [swapRouterAddress, tokenABalance], gasPrice)
        const broadcasted = await waitForTx(wallet.provider, approvalResult.hash)
        if (!broadcasted) {
            throw new Error(`TX broadcast timeout for ${approvalResult.hash}`)
        } else {
            console.log(`Spending of ${tokenABalance.toBigInt()} approved.`)
        }
    }

    const swapDeadline = Math.floor((Date.now() / 1000) + (60 * 60))
    const swapTxInputs = [
        tokenAAddress,
        tokenBAddress,
        BigNumber.from(3000),
        walletAddress,
        BigNumber.from(swapDeadline),
        tokenABalance,
        BigNumber.from(0),
        BigNumber.from(0)
    ]

    const swapTxResponse = await callContractMethod(swapRouterContract, 'exactInputSingle', [swapTxInputs], gasPrice)
    
    return swapTxResponse

}