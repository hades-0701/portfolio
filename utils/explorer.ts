import { PublicKey } from '@solana/web3.js'

export function getExplorerUrl(
  endpoint: string,
  viewTypeOrItemAddress: 'inspector' | PublicKey | string | string[],
  itemType = 'address' // | 'tx' | 'block'
) {
  const getClusterUrlParam = () => {
    let cluster = ''
    if (endpoint === 'https://metaplex.devnet.rpcpool.com/') {
      cluster = 'devnet-qn1'
    } else {
      cluster = 'mainnet-qn1'
    }

    return cluster ? `?cluster=${cluster}` : ''
  }

  return `https://solana.fm/${itemType}/${viewTypeOrItemAddress}${getClusterUrlParam()}`
}
