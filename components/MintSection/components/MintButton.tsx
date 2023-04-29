import { useWallet } from '@solana/wallet-adapter-react'

export default function MintButton({ onMint }: { onMint: () => Promise<void> }) {
  const wallet = useWallet()

  return (
    <button
      className="flex h-[27px] flex-1 items-center justify-center gap-2.5 rounded-[6px] bg-btn-connect bg-[length:100%_130%] px-6 text-center font-secondary text-[16px] font-normal uppercase leading-6 tracking-[0.01em] text-[#95DBD5] transition-all duration-300 hover:bg-[length:100%_120%] lg:h-[57px] lg:rounded-[12px] lg:text-[35px]"
      disabled={false}
      onClick={async () => {
        if (!wallet.connected) wallet.connect()

        await onMint()
      }}
    >
      Mint
      <div className="h-3 w-3 lg:h-6 lg:w-6">
        <img src="/icons/mint-logo.svg" alt="" />
      </div>
    </button>
  )
}
