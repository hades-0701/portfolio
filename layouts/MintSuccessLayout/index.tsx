import { ReactNode } from 'react'
import MintSuccessHeader from 'components/Header/MintSuccessHeader'

const MintSuccessLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <MintSuccessHeader />
      <main>{children}</main>
    </div>
  )
}

export default MintSuccessLayout
