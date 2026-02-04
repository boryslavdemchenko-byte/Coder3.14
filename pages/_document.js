import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/favicon-round.svg" />
      </Head>
      <body className="bg-[#0B0C0E] text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
