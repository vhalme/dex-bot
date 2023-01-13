import { initializeWallet } from './dexWallet'
import { promisify } from 'util'
import { POLYGON } from './networks'

const txHash = process.argv[2]

const main = promisify(async () => {
  const dexWallet = await initializeWallet(POLYGON[0])
  const { wallet } = dexWallet
  const txReceipt = await wallet.provider.getTransactionReceipt(txHash)
  console.log('TX RECEIPT', txReceipt)
})

main().then(() => {
  console.log('Async operation completed')
})
