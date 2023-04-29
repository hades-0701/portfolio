// custom components
import MintLayout from 'layouts/MintLayout'
import MintSection from 'components/MintSection'
import JoinCommunitySection from 'components/JoinCommunitySection'

const MintPage = () => {
  return (
    <>
      <MintSection />
      <JoinCommunitySection />
    </>
  )
}

export default MintPage

MintPage.getLayout = function getLayout(page) {
  return <MintLayout>{page}</MintLayout>
}
