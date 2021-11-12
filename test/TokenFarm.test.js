const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function convertTokenToWei(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    // Load Contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    // Transfer all Dapp tokens to farm (1 Million)
    await dappToken.transfer(tokenFarm.address, convertTokenToWei('1000000'))

    await daiToken.transfer(investor, convertTokenToWei('100'), { from: owner })
  })

  describe('Mock DAI deployment', async () => {

    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('DApp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), convertTokenToWei('1000000'))
    })
  })
})