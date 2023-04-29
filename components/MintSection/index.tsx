import { useCallback, useEffect, useMemo, useState } from 'react'

// next components
import { useRouter } from 'next/router'
import Image from 'next/image'

import styled from 'styled-components'

import * as anchor from '@project-serum/anchor'
import { Commitment, Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Snackbar, Paper, LinearProgress, Chip } from '@material-ui/core'

import Countdown from 'react-countdown'
import { AlertState, getAtaForMint, toDate } from 'candy-machine/utils'

import {
  awaitTransactionSignatureConfirmation,
  CANDY_MACHINE_PROGRAM,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
} from 'candy-machine/candy-machine'
import MintButton from './components/MintButton'
import ConnectButton from './components/ConnetButton'

// images and icons
import BrandBlueImage from 'assets/images/brand-blue.png'
import LogoImg from 'assets/images/logo.png'
import InstagramIcon from 'assets/icons/instagram.svg'
import DiscordIcon from 'assets/icons/discord.svg'
import TwitterIcon from 'assets/icons/twitter.svg'

import { toast } from 'react-toastify'

export const DEFAULT_TIMEOUT = 60000

const cluster = process.env.NEXT_APP_SOLANA_NETWORK!.toString()
const decimals = process.env.NEXT_APP_SPL_TOKEN_TO_MINT_DECIMALS
  ? +process.env.NEXT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString()
  : 9
const splTokenName = process.env.NEXT_APP_SPL_TOKEN_TO_MINT_NAME
  ? process.env.NEXT_APP_SPL_TOKEN_TO_MINT_NAME.toString()
  : 'TOKEN'

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(process.env.NEXT_APP_CANDY_MACHINE_ID!)

    return candyMachineId
  } catch (e) {
    console.warn('Failed to construct CandyMachineId', e)
    return undefined
  }
}

const BorderLinearProgress = styled(LinearProgress)``
const candyMachineId = getCandyMachineId()

export default function MintSection() {
  const router = useRouter()

  const [balance, setBalance] = useState<number>()
  const [isMinting, setIsMinting] = useState(false) // true when user got to press MINT
  const [isActive, setIsActive] = useState(false) // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>('')
  const [itemsAvailable, setItemsAvailable] = useState(0)
  const [itemsRedeemed, setItemsRedeemed] = useState(0)
  const [itemsRemaining, setItemsRemaining] = useState(0)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [payWithSplToken, setPayWithSplToken] = useState(false)
  const [price, setPrice] = useState(0)
  const [priceLabel, setPriceLabel] = useState<string>('SOL')
  const [whitelistPrice, setWhitelistPrice] = useState(0)
  const [whitelistEnabled, setWhitelistEnabled] = useState(false)
  const [isBurnToken, setIsBurnToken] = useState(false)
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0)
  const [isEnded, setIsEnded] = useState(false)
  const [endDate, setEndDate] = useState<Date>()
  const [isPresale, setIsPresale] = useState(false)
  const [isWLOnly, setIsWLOnly] = useState(false)

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  })

  const [needTxnSplit, setNeedTxnSplit] = useState(true)
  const [setupTxn, setSetupTxn] = useState<SetupState>()
  // const LeftContainer = styled.div`

  //  width: 50%;
  //  max-width: 50%;
  // text-align: left;
  // margin: 10px;
  // margin-botton: 100px;
  // `;

  const { connection } = useConnection()

  const wallet = useWallet()

  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

  const solFeesEstimation = 0.012 // approx of account creation fees

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet
  }, [wallet])

  const refreshCandyMachineState = useCallback(
    async (commitment: Commitment = 'confirmed') => {
      if (!anchorWallet) {
        return
      }

      if (candyMachineId) {
        try {
          const cndy = await getCandyMachineState(anchorWallet, candyMachineId, connection)

          setCandyMachine(cndy)
          setItemsAvailable(cndy.state.itemsAvailable)
          setItemsRemaining(cndy.state.itemsRemaining)
          setItemsRedeemed(cndy.state.itemsRedeemed)

          var divider = 1
          if (decimals) {
            divider = +('1' + new Array(decimals).join('0').slice() + '0')
          }

          // detect if using spl-token to mint
          if (cndy.state.tokenMint) {
            setPayWithSplToken(true)
            // Customize your SPL-TOKEN Label HERE
            // TODO: get spl-token metadata name
            setPriceLabel(splTokenName)
            setPrice(cndy.state.price.toNumber() / divider)
            setWhitelistPrice(cndy.state.price.toNumber() / divider)
          } else {
            setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL)
            setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL)
          }

          // fetch whitelist token balance
          if (cndy.state.whitelistMintSettings) {
            setWhitelistEnabled(true)
            setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime)
            setIsPresale(cndy.state.whitelistMintSettings.presale)
            setIsWLOnly(!isPresale && cndy.state.whitelistMintSettings.discountPrice === null)

            if (
              cndy.state.whitelistMintSettings.discountPrice !== null &&
              cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price
            ) {
              if (cndy.state.tokenMint) {
                setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider)
              } else {
                setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL)
              }
            }

            let balance = 0
            try {
              const tokenBalance = await connection.getTokenAccountBalance(
                (
                  await getAtaForMint(cndy.state.whitelistMintSettings.mint, anchorWallet.publicKey)
                )[0]
              )

              balance = tokenBalance?.value?.uiAmount || 0
            } catch (e) {
              console.error(e)
              balance = 0
            }
            if (commitment !== 'processed') {
              setWhitelistTokenBalance(balance)
            }
            setIsActive(isPresale && !isEnded && balance > 0)
          } else {
            setWhitelistEnabled(false)
          }

          // end the mint when date is reached
          if (cndy?.state.endSettings?.endSettingType.date) {
            setEndDate(toDate(cndy.state.endSettings.number))
            if (cndy.state.endSettings.number.toNumber() < new Date().getTime() / 1000) {
              setIsEnded(true)
              setIsActive(false)
            }
          }
          // end the mint when amount is reached
          if (cndy?.state.endSettings?.endSettingType.amount) {
            let limit = Math.min(cndy.state.endSettings.number.toNumber(), cndy.state.itemsAvailable)
            setItemsAvailable(limit)
            if (cndy.state.itemsRedeemed < limit) {
              setItemsRemaining(limit - cndy.state.itemsRedeemed)
            } else {
              setItemsRemaining(0)
              cndy.state.isSoldOut = true
              setIsEnded(true)
            }
          } else {
            setItemsRemaining(cndy.state.itemsRemaining)
          }

          if (cndy.state.isSoldOut) {
            setIsActive(false)
          }

          const [collectionPDA] = await getCollectionPDA(candyMachineId)
          const collectionPDAAccount = await connection.getAccountInfo(collectionPDA)

          const txnEstimate =
            892 +
            (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
            (cndy.state.tokenMint ? 66 : 0) +
            (cndy.state.whitelistMintSettings ? 34 : 0) +
            (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
            (cndy.state.gatekeeper ? 33 : 0) +
            (cndy.state.gatekeeper?.expireOnUse ? 66 : 0)

          setNeedTxnSplit(txnEstimate > 1230)
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === `Account does not exist ${candyMachineId}`) {
              setAlertState({
                open: true,
                message: `Couldn't fetch candy machine state from candy machine with address: ${candyMachineId}! You probably typed the NEXT_APP_CANDY_MACHINE_ID value in wrong in your .env file, or you are using the wrong RPC!`,
                severity: 'error',
                hideDuration: null,
              })
            } else if (e.message.startsWith('failed to get info about account')) {
              setAlertState({
                open: true,
                message: `Couldn't fetch candy machine state! This probably means you have an issue with the NEXT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
                severity: 'error',
                hideDuration: null,
              })
            }
          } else {
            setAlertState({
              open: true,
              message: `${e}`,
              severity: 'error',
              hideDuration: null,
            })
          }
          console.error(e)
        }
      } else {
        setAlertState({
          open: true,
          message: `Your NEXT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`,
          severity: 'error',
          hideDuration: null,
        })
      }
    },
    [anchorWallet, candyMachineId, isEnded, isPresale, connection]
  )

  function displaySuccess(mintPublicKey: any, qty: number = 1): void {
    let remaining = itemsRemaining - qty
    setItemsRemaining(remaining)
    setIsSoldOut(remaining === 0)
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - qty
      setWhitelistTokenBalance(balance)
      setIsActive(isPresale && !isEnded && balance > 0)
    }
    setSetupTxn(undefined)
    setItemsRedeemed(itemsRedeemed + qty)
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(balance - (whitelistEnabled ? whitelistPrice : price) * qty - solFeesEstimation)
    }
    setSolanaExplorerLink(
      cluster === 'devnet' || cluster === 'testnet'
        ? 'https://solscan.io/token/' + mintPublicKey + '?cluster=' + cluster
        : 'https://solscan.io/token/' + mintPublicKey
    )
    setIsMinting(false)
  }

  const onMint = async (beforeTransactions: Transaction[] = [], afterTransactions: Transaction[] = []) => {
    try {
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setIsMinting(true)
        let setupMint: SetupState | undefined
        if (needTxnSplit && setupTxn === undefined) {
          setAlertState({
            open: true,
            message: 'Please validate account setup transaction',
            severity: 'info',
          })
          setupMint = await createAccountsForMint(candyMachine, wallet.publicKey)
          let status: any = { err: true }
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              DEFAULT_TIMEOUT,
              connection,
              true
            )
          }
          if (status && !status.err) {
            setSetupTxn(setupMint)
            setAlertState({
              open: true,
              message: 'Setup transaction succeeded! You can now validate mint transaction',
              severity: 'info',
            })
          } else {
            setAlertState({
              open: true,
              message: 'Mint failed! Please try again!',
              severity: 'error',
            })
            return
          }
        }

        const setupState = setupMint ?? setupTxn
        const mint = setupState?.mint ?? anchor.web3.Keypair.generate()
        let mintResult = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          mint,
          beforeTransactions,
          afterTransactions,
          setupState
        )

        let status: any = { err: true }
        let metadataStatus = null
        if (mintResult) {
          status = await awaitTransactionSignatureConfirmation(mintResult.mintTxId, DEFAULT_TIMEOUT, connection, true)

          metadataStatus = await candyMachine.program.provider.connection.getAccountInfo(
            mintResult.metadataKey,
            'processed'
          )
        }

        if (status && !status.err && metadataStatus) {
          // window.location.replace('.\\foster-turkey-main\\componentsMint\\index2.tsx')
          console.log('MINT SUCCESS')
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          })

          // update front-end amounts
          displaySuccess(mint.publicKey)
          refreshCandyMachineState('processed')
          router.push('/mint-success?id=' + mint.publicKey.toBase58())
        } else if (status && !status.err) {
          toast.warn(
            "Your mint may have succeeded, but we couldn't retrieve metadata from Solana. Please check your wallet.",
            {
              position: 'bottom-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
            }
          )
          console.log('MINT MAY HAVE FAILED')
          setAlertState({
            open: true,
            message:
              'Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.',
            severity: 'error',
            hideDuration: 8000,
          })
          refreshCandyMachineState()
        } else {
          console.log('MINT FAILED')
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          })
          refreshCandyMachineState()
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!'
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.'
        } else if (error.message.indexOf('0x138')) {
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setIsMinting(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (anchorWallet) {
        const balance = await connection.getBalance(anchorWallet!.publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      }
    })()
  }, [anchorWallet, connection])

  useEffect(() => {
    refreshCandyMachineState()
  }, [anchorWallet, candyMachineId, connection, isEnded, isPresale, refreshCandyMachineState])

  return (
    <section className="relative z-10 flex min-h-screen flex-col overflow-hidden pt-20 pb-[0px] sm:bg-hero-header md:pt-[75px] lg:pb-[72px]">
      <div className="m-12 flex lg:hidden">
        <Image src={LogoImg} alt="" />
      </div>
      <div className="absolute top-16 -left-[300px] block w-[950px] lg:hidden">
        <Image src={BrandBlueImage} alt="" className="z-0" />
      </div>
      <div className="grid grid-cols-12 items-center justify-between gap-5 px-4 pt-14 sm:px-8 lg:flex-row lg:gap-10 lg:pt-[87px] xl:pl-20 xl:pr-16">
        {/* left part */}
        <div className="relative order-last col-span-12 w-full pb-72 lg:order-none lg:col-span-6 lg:pb-48">
          <div className="absolute z-0 hidden lg:inset-0 lg:flex">
            <Image src={BrandBlueImage} alt="" className="object-cover" />
          </div>
          <div className="z-10 mt-28 mb-4 hidden lg:block">
            <Image src={LogoImg} alt="" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-2.5 sm:justify-start sm:gap-10">
            <p className="text-[18px] font-bold text-[#95dbd5] md:text-[28px]">
              Total Supply: <span className="pl-1">3,200</span>
            </p>
            <ul className="z-10 flex items-center gap-3 sm:gap-5">
              <li>
                <a
                  href="https://www.instagram.com/fostermarketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#202427] transition-all md:h-[46px] md:w-[46px] lg:rounded-[8px]"
                >
                  <div className="flex w-5 items-center justify-center lg:w-8">
                    <Image src={InstagramIcon} alt="" />
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/fostermarketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#202427] transition-all md:h-[46px] md:w-[46px] lg:rounded-[8px]"
                >
                  <div className="flex w-5 items-center justify-center lg:w-8">
                    <Image src={DiscordIcon} alt="" />
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/circus_dao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#202427] transition-all md:h-[46px] md:w-[46px] lg:rounded-[8px]"
                >
                  <div className="flex w-5 items-center justify-center lg:w-8">
                    <Image src={TwitterIcon} alt="" />
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="z-10 mt-3.5 mb-3.5 pb-1 text-xs text-[14px] font-normal text-[#eff0f6] md:mt-[22px] md:mb-10 md:text-[24px] md:leading-6 lg:mb-20">
              Turkey Circus is a digital art collection representing the governance wing of Foster Marketplace. Turkey
              Circus custodians inherit a 5% revenue share of Foster House Collections and an autonomous vote in the
              DAO.
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative z-0 ml-auto w-full max-w-[877px] rounded-md bg-[#121212] bg-presalte bg-cover bg-right bg-blend-multiply shadow-presale backdrop-blur-0 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-right before:bg-no-repeat before:content-[''] sm:rounded-2xl sm:px-8 sm:pt-8 sm:pb-7 sm:before:bg-presalte-flower md:block lg:bg-[#173639]/30 lg:backdrop-blur-xl">
              <div className="rounded-2xl bg-[#121212] px-6 py-2.5 backdrop-blur-0 sm:px-[30px] sm:py-6 lg:bg-[#173639]/30 lg:backdrop-blur-xl">
                <div className="mb-1 flex items-center justify-between gap-4 sm:mb-2">
                  <p className="text-sm font-normal text-[#EFF0F6]/80">{wallet?.connected ? 'Total Mint' : ' '}</p>
                  <div className="flex items-center gap-2.5 sm:gap-6">
                    {wallet?.connected ? (
                      <p className="text-sm text-[#EFF0F6] text-[#EFF0F6]/80 sm:text-base">
                        ({itemsRedeemed}/{itemsAvailable})
                      </p>
                    ) : (
                      <p className="text-sm text-[#EFF0F6] text-[#EFF0F6]/80 sm:text-base"></p>
                    )}
                  </div>
                </div>

                <div>
                  {wallet?.connected && (
                    <BorderLinearProgress
                      className="relative mb-4 h-1 w-full overflow-hidden rounded-md sm:bg-progress"
                      variant="determinate"
                      value={100 - (itemsRemaining * 100) / itemsAvailable}
                    />
                  )}{' '}
                </div>

                <div className="flex items-end gap-2 sm:items-center sm:gap-5">
                  <div className="flex items-end gap-1.5 sm:items-center sm:gap-8">
                    <div>
                      <h4 className="mb-0 text-xs font-bold text-[#EFF0F6]/80 lg:mb-2.5 lg:text-lg">Price</h4>
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/Desktop/Not Connected/Sol Ticker Component.svg"
                          alt="Sol Ticker"
                          className="h-3 w-3 flex-shrink-0 object-contain lg:h-6 lg:w-6"
                        />
                        <p className="leading-2 text-sm font-semibold text-[#EFF0F6] lg:text-2xl">2</p>
                      </div>
                    </div>
                  </div>
                  {!wallet?.connected ? <ConnectButton /> : <MintButton onMint={onMint} />}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* right part */}
        <div className="relative z-0 col-span-12 w-full lg:col-span-6">
          <img
            src="/images/Desktop/Not Connected/Epic Circle.svg"
            alt="epic-circle"
            className="pointer-events-none absolute -top-9 left-1/4 -z-10 w-full max-w-[225px] -translate-x-1/3 object-contain sm:top-0 sm:max-w-xs xl:max-w-md"
          />
          <div className="flex h-full w-full items-center justify-end md:justify-center">
            <div
              className="flex w-5/6 object-contain sm:mt-12 lg:w-2/3 xl:w-3/5"
              dangerouslySetInnerHTML={{
                __html: `<video className="app__backgroundVideo" autoplay loop muted playsinline style="width: 100%">
                  <source src="/videos/Turkey_Loop_Frame_Cropped_MP4.mp4" type="video/mp4" /></video>`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
