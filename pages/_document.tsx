import Document, { Html, Head, Main, NextScript } from 'next/document'

class AppDocument extends Document {
  override render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/images/Turkey_Circus_Favicon.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AppDocument
