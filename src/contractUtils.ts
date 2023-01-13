import { BigNumber, Contract } from 'ethers'

export async function callContractMethod(contract: Contract, method: string, inputs: any[], gasPrice: BigNumber) {

    console.log(`${method}(${inputs})`)
    
    let gasLimit = BigNumber.from(500000)

    try {
        const gasEstimate: BigNumber = await contract.estimateGas[method](...inputs)
        const gasLimit = gasEstimate.mul(2)
        console.log('Gas estimate:', gasEstimate.toBigInt())
        console.log('   Gas limit:', gasLimit.toBigInt())
    } catch (error) {
        console.log('Default gas limit:', gasLimit.toBigInt())
    }
    

    const txResponse = await contract[method](...inputs, { gasPrice, gasLimit })
    console.log('Done! Tx Hash:', txResponse.hash)
    return txResponse

}