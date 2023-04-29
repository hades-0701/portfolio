import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { SolletWalletAdapter, SolletExtensionWalletAdapter } from '@solana/wallet-adapter-sollet'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

require('@solana/wallet-adapter-react-ui/styles.css')

const rpcHost = process.env.NEXT_APP_SOLANA_RPC_HOST!

const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolletExtensionWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={rpcHost}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default SolanaProvider
