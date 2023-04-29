import { useMemo } from 'react'

// next components
import { useRouter } from 'next/router'
import Image from 'next/image'

// third party components
import { TwitterShareButton } from 'react-share'

// custom components
import MintSuccessLayout from 'layouts/MintSuccessLayout'

//explorer
import { getExplorerUrl } from 'utils/explorer'
import { useConnection } from '@solana/wallet-adapter-react'

// images and icons
import DaoImg from 'assets/images/dao.png'

const MintSuccess = () => {
  const router = useRouter()

  const { id } = router.query

  const { connection } = useConnection()
  const explorerURL = useMemo(() => getExplorerUrl(connection.rpcEndpoint, id), [id, connection])

  return (
    <div className="mt-[80px] flex min-h-[calc(100vh_-_80px)] items-center bg-[url('../assets/images/turkey-ringleader.png')] bg-[length:500px_500px] bg-bottom bg-no-repeat px-4 sm:px-8 md:bg-[length:800px_800px] lg:mt-[100px] lg:min-h-[calc(100vh_-_100px)] lg:bg-auto lg:bg-left">
      <div className="mx-auto flex w-full max-w-[568px] flex-wrap justify-center text-center">
        <h2 className="mb-5 w-full font-secondary text-[40px] font-normal text-[#95DBD5] sm:mb-6 lg:text-[78px]">
          Welcome to the
        </h2>
        <Image src={DaoImg} alt="" />
        <p className="mt-[30px] mb-1 w-full text-[16px] font-bold text-[#EFF0F6] sm:mt-[130px] lg:mt-[70px] lg:text-[18px]">
          Your Turkey Circus NFT has been minted successfully!
        </p>
        <p className="mb-1 w-full text-[11px] font-semibold text-[#EFF0F6]/75 lg:text-[12px]">
          Check and refresh your wallet, it might not appear immediately.
        </p>
        <div className="mt-[70px] flex w-full max-w-[490px] flex-wrap items-center justify-center gap-7 sm:mt-5 lg:mt-10 lg:justify-between lg:gap-12">
          <TwitterShareButton
            url={explorerURL}
            title={
              'LFGobble. Just joined the @turkeycircusdao - minting now on mint.turkeycircus.io #solanathanksgiving #solanaNFTs'
            }
            beforeOnClick={() => {}}
            onShareWindowClose={() => {}}
          >
            <a
              href={explorerURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-[200px] items-center justify-center gap-2 rounded-xl bg-btn py-[12px] text-center font-secondary text-[30px] leading-none tracking-wide text-[#95DBD5] drop-shadow-[0_2px_6px_rgba(149,219,213,1)] md:text-[35px]" //shadow-md shadow-[#95DBD5]
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20.352" viewBox="0 0 25 20.352">
                <path
                  id="twitter-7"
                  d="M27,6.288a10.613,10.613,0,0,1-2.95.8A5.163,5.163,0,0,0,26.312,4.25,10.263,10.263,0,0,1,23.05,5.5a5.125,5.125,0,0,0-8.75,4.675A14.55,14.55,0,0,1,3.738,4.813,5.2,5.2,0,0,0,3.05,7.4a5.112,5.112,0,0,0,2.275,4.262A5.062,5.062,0,0,1,3,11.025v.063a5.125,5.125,0,0,0,4.125,5A4.912,4.912,0,0,1,5.75,16.3a6.125,6.125,0,0,1-.962-.088,5.137,5.137,0,0,0,4.787,3.55,10.275,10.275,0,0,1-6.325,2.2A9.914,9.914,0,0,1,2,21.888,14.462,14.462,0,0,0,9.862,24.2,14.487,14.487,0,0,0,24.5,9.6V8.938A10.538,10.538,0,0,0,27,6.288Z"
                  transform="translate(-2 -3.849)"
                  fill="#95dbd5"
                />
              </svg>
              Tweet your Mint
            </a>
          </TwitterShareButton>
          <a
            href={explorerURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[200px] items-center justify-center rounded-xl border-[1px] border-[#95DBD5] py-[12px] text-center font-secondary text-[30px] leading-none tracking-wide text-[#95DBD5] backdrop-blur-md hover:shadow-lg hover:shadow-[#95DBD5] md:text-[35px]"
          >
            View Your Mint
          </a>
        </div>
      </div>
      {/* )} */}
    </div>
  )
}

export default MintSuccess

MintSuccess.getLayout = function getLayout(page) {
  return <MintSuccessLayout>{page}</MintSuccessLayout>
}
