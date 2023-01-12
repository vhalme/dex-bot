import { pumpOrDump } from './pancakeswap/interact'
import { promisify } from 'util'

const token1 = process.argv[2]
const token2 = process.argv[3]
const action = process.argv[4]

const main = promisify(async () => {
    await pumpOrDump(token1, token2, action)
  })

main().then(() => {
    console.log('Async operation completed')
})
