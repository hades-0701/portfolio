import 'styles/globals.scss'

// import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import Providers from 'providers'

const MyApp = ({ Component, pageProps, cluster }) => {
  const getLayout = Component.getLayout || (page => page)
  return (
    <Providers>
      <Head>
        <title>Turkey Mint - Foster</title>
      </Head>
      {getLayout(<Component {...pageProps} />)}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Providers>
  )
}

export default MyApp
