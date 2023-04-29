import { ReactNode } from 'react'
import { Provider as StoreProvider } from 'react-redux'
import SolanaProvider from './SolanaProvider'
import store from 'store'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider store={store}>
      <SolanaProvider>{children}</SolanaProvider>
    </StoreProvider>
  )
}
