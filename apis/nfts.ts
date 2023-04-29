import client from './client'

const API_URL = `${process.env.NEXT_APP_API_URL}/v1/lfgobble/`

class Nfts {
  getNft(tokenID) {
    return client
      .get(API_URL + tokenID)
      .then(response => {
        return response.data
      })
      .catch(error => {
        return error
      })
  }
}

export default new Nfts()
