# DEX-BOT

DEX-BOT is an application for trading on decentralized exchanges

## Installation

```shell
npm install
```

## Usage

### Main process

```shell
npm start
```

### Pump-and-dump tool for PancakeSwap

This tool buys or sells the entire balance of a specified token in the pair

```shell
npm run src/pumpOrDump.ts <token1> token2> <action>
```

Command line arguments:

token1: Reserve token name if configured (eg. WBNB) or token contract address
token2: Shit token's name if configured (eg. DARK) or token contract address
action: 'pump' | 'dump'
Pump sells all of token1 for token2
Dump reverses the pump selling all of token2 for token1

Examples:

```shell
npm run src/pumpOrDump.ts WBNB ACH pump
npm run src/pumpOrDump.ts WBNB 0xBc7d6B50616989655AfD682fb42743507003056D dump
npm run src/pumpOrDump.ts 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c 0xBc7d6B50616989655AfD682fb42743507003056D pump
```
