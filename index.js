require('dotenv').config()

const { Toolkit } = require('actions-toolkit')
const { GistBox, MAX_LINES, MAX_LENGTH } = require('gist-box')

const capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = str =>
  str.length <= MAX_LENGTH ? str : str.slice(0, MAX_LENGTH - 3) + '...'

const serializers = {
  IssueCommentEvent: item => {
    return `🗣 Commented on #${item.payload.issue.number} in ${item.repo.name}`
  },
  IssuesEvent: item => {
    return `❗️ ${capitalize(item.payload.action)} issue #${
      item.payload.issue.number
    } in ${item.repo.name}`
  },
  PullRequestEvent: item => {
    const emoji = item.payload.action === 'opened' ? '💪' : '❌'
    const line = item.payload.pull_request.merged
      ? '🎉 Merged'
      : `${emoji} ${capitalize(item.payload.action)}`
    return `${line} PR #${item.payload.pull_request.number} in ${
      item.repo.name
    }`
  }
}

Toolkit.run(
  async tools => {
    const { GIST_ID, GITHUB_USERNAME, GITHUB_PAT } = process.env

    // Need to re-authenticate to use the Gist API
    tools.github.authenticate({
      type: 'token',
      token: `token ${GITHUB_PAT}`
    })

    // Get the user's public events
    const events = await tools.github.activity.listPublicEventsForUser({
      username: GITHUB_USERNAME,
      per_page: 100
    })

    const content = events.data
      // Filter out any boring activity
      .filter(event => serializers.hasOwnProperty(event.type))
      // We only have five lines to work with
      .slice(0, MAX_LINES)
      // Call the serializer to construct a string
      .map(item => serializers[item.type](item))
      // Truncate if necessary
      .map(truncate)
      // Join items to one string
      .join('\n')

    const box = new GistBox({ id: GIST_ID, token: GITHUB_PAT })
    try {
      await box.update({ content })
      tools.exit.success('Gist updated!')
    } catch (err) {
      return tools.exit.failure(err)
    }
  },
  {
    event: 'schedule',
    secrets: ['GITHUB_PAT', 'GITHUB_USERNAME', 'GIST_ID']
  }
)
