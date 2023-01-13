import { swap } from './uniswap/swap'
import { promisify } from 'util'
import { initializeWallet } from './dexWallet'
import { POLYGON } from './networks'

const main = promisify(async () => {
    const dexWallet = await initializeWallet(POLYGON[0])
    await swap(
        dexWallet,
        [
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
            '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'  // WETH
        ]
        ,true
    )
  });

main().then(() => {
    console.log('Async operation completed')
});

