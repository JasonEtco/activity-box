const { Toolkit } = require('actions-toolkit')
const nock = require('nock')
const { GistBox } = require('gist-box')

jest.mock('gist-box')

const events = [
  {
    type: 'IssuesEvent',
    repo: { name: 'clippy/take-over-github' },
    payload: { action: 'opened', issue: { number: 1 } }
  },
  {
    type: 'IssueCommentEvent',
    repo: { name: 'clippy/take-over-github' },
    payload: { action: 'closed', issue: { number: 1 } }
  },
  {
    type: 'PullRequestEvent',
    repo: { name: 'clippy/take-over-github' },
    payload: { action: 'closed', pull_request: { number: 2, merged: true } }
  },
  {
    type: 'PullRequestEvent',
    repo: { name: 'clippy/take-over-github' },
    payload: { action: 'closed', pull_request: { number: 3, merged: false } }
  },
  {
    type: 'PullRequestEvent',
    repo: {
      name:
        'clippy/really-really-really-really-really-really-really-really-really-long'
    },
    payload: { action: 'opened', pull_request: { number: 3 } }
  }
]

describe('activity-box', () => {
  let action, tools

  beforeEach(() => {
    GistBox.prototype.update = jest.fn()

    Toolkit.run = fn => {
      action = fn
    }

    require('..')

    nock('https://api.github.com')
      // Get the user's recent activity
      .get('/users/clippy/events/public?per_page=100')
      .reply(200, events)

    tools = new Toolkit({
      logger: {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        fatal: jest.fn(),
        debug: jest.fn()
      }
    })

    tools.exit = {
      success: jest.fn(),
      failure: jest.fn()
    }
  })

  it('updates the Gist with the expected string', async () => {
    await action(tools)
    expect(GistBox.prototype.update).toHaveBeenCalled()
    expect(GistBox.prototype.update.mock.calls[0][0]).toMatchSnapshot()
  })

  it('handles failure to update the Gist', async () => {
    GistBox.prototype.update.mockImplementationOnce(() => {
      throw new Error(404)
    })

    await action(tools)
    expect(tools.exit.failure).toHaveBeenCalled()
    expect(tools.exit.failure.mock.calls).toMatchSnapshot()
  })
})
