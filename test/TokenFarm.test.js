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

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result

      // Check investor balance before staking
      result = await daiToken.balanceOf(investor)
      assert.equal(
        result.toString(),
        convertTokenToWei('100'),
        'investor Mock DAI wallet balance correct before staking'
      )

      // Stake Mock DAI Tokens
      await daiToken.approve(
        tokenFarm.address,
        convertTokenToWei('100'),
        {
          from: investor
        }
      )

      await tokenFarm.stakeTokens(convertTokenToWei('100'), { from: investor })

      // Check staking result
      result = await daiToken.balanceOf(investor)
      assert.equal(
        result.toString(),
        convertTokenToWei('0'),
        'investor Mock DAI wallet balance correct after staking'
      )

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(
        result.toString(),
        convertTokenToWei('100'),
        'Token Farm Mock DAI balance correct after staking'
      )

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(
        result.toString(),
        convertTokenToWei('100'),
        'Investor staking balance correct after staking'
      )

      result = await tokenFarm.isStaking(investor)
      assert.equal(
        result.toString(),
        'true',
        'investor staking status correct after staking'
      )

      // Issue Tokens
      await tokenFarm.issueTokens({ from: owner })

      // Check balances after issuance
      result = await dappToken.balanceOf(investor)
      assert.equal(
        result.toString(),
        convertTokenToWei('100'),
        'investor DApp Token wallet balance correct after issuance'
      )

      // Ensure that only owner can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;
    })
  })
})