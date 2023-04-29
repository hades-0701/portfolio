import { ReactNode } from 'react'
import Footer from 'components/Footer'
import MintHeader from 'components/Header/MintHeader'

const MintLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="">
      <MintHeader />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default MintLayout
