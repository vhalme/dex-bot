import { quotePair } from './uniswap/interact'
import { promisify } from 'util'

const main = promisify(async () => {
    await quotePair()
  });

main().then(() => {
    console.log('Async operation completed')
});

