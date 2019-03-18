const nock = require('nock')
const { createBody, updateGist } = require('../')

const events = [{
  type: 'IssuesEvent',
  repo: { name: 'clippy/take-over-github' },
  payload: { action: 'opened', issue: { number: 1 } }
}, {
  type: 'IssueCommentEvent',
  repo: { name: 'clippy/take-over-github' },
  payload: { action: 'closed', issue: { number: 1 } }
}, {
  type: 'PullRequestEvent',
  repo: { name: 'clippy/take-over-github' },
  payload: { action: 'closed', pull_request: { number: 2, merged: true } }
}, {
  type: 'PullRequestEvent',
  repo: { name: 'clippy/take-over-github' },
  payload: { action: 'closed', pull_request: { number: 3, merged: false } }
}]

describe('activity-box', () => {
  beforeEach(() => {
    nock('https://api.github.com')
      .get('/users/clippy/events/public?per_page=100')
      .reply(200, events)
      .get('/gists/456def')
      .reply(200, { description: 'a gist', files: ['a file'] })
      .patch('/gists/456def')
      .reply(200)
  })

  describe('createBody', () => {
    it('returns the expected string', async () => {
      const actual = await createBody()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('updateGist', () => {
    beforeEach(() => {
      console.log = jest.fn()
      console.error = jest.fn()
    })

    it('updates the Gist with the provided string', async () => {
      await updateGist('hello')
      expect(console.log).toHaveBeenCalledWith('Gist updated!')
    })
  })
})