require('dotenv').config()
const { Toolkit } = require('actions-toolkit')

const capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = str => (str.length <= 46 ? str : str.slice(0, 43) + '...')

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
      .slice(0, 5)
      // Call the serializer to construct a string
      .map(item => serializers[item.type](item))
      // Truncate if necessary
      .map(truncate)
      // Join items to one string
      .join('\n')

    let gist
    try {
      gist = await tools.github.gists.get({ gist_id: GIST_ID })
      tools.log(`Found Gist: ${gist.data.description}`)
    } catch (error) {
      return tools.exit.failure(`Unable to get gist\n${error}`)
    }

    // Get original filename to update that same file
    const filename = Object.keys(gist.data.files)[0]

    try {
      await tools.github.gists.update({
        gist_id: GIST_ID,
        files: {
          [filename]: { content }
        }
      })

      tools.log.success('Gist updated!')
    } catch (error) {
      tools.exit.failure(`Unable to update gist\n${error}`)
    }
  },
  {
    event: 'schedule',
    secrets: ['GITHUB_PAT', 'GITHUB_USERNAME', 'GIST_ID']
  }
)
