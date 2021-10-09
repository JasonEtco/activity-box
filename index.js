require('dotenv').config()

const { Toolkit } = require('actions-toolkit')
const { GistBox, MAX_LINES, MAX_LENGTH } = require('gist-box')

const capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = str =>
  str.length <= MAX_LENGTH ? str : str.slice(0, MAX_LENGTH - 3) + '...'

const serializers = {
  ForkEvent: item => {
    return `🔱 Forked from ${item.repo.name}`
  },
  IssueCommentEvent: item => {
    return `🗣 Commented on #${item.payload.issue.number} in ${item.repo.name}`
  },
  IssuesEvent: item => {
    return `❗️ ${capitalize(item.payload.action)} issue #${
      item.payload.issue.number
    } in ${item.repo.name}`
  },
  PublicEvent: item => {
    return `💯 Published ${item.repo.name}`
  },
  PullRequestEvent: item => {
    const emoji = item.payload.action === 'opened' ? '💪' : '❌'
    const line = item.payload.pull_request.merged
      ? '🎉 Merged'
      : `${emoji} ${capitalize(item.payload.action)}`
    return `${line} PR #${item.payload.pull_request.number} in ${
      item.repo.name
    }`
  },
  PushEvent: item => {
    return `💾 Pushed to ${item.repo.name}`
  },
  ReleaseEvent: item => {
    if (item.payload.action === 'published') {
      return `✨ Released ${item.payload.release.tag_name} on ${item.repo.name}`
    } else {
      return ''
    }
  },
  WatchEvent: item => {
    if (item.payload.action === 'started') {
      return `⭐ Starred ${item.repo.name}`
    } else {
      return ''
    }
  }
}

function cleanupPushes(content) {
  let count = 0
  let edit = 0
  for (let i = 0; i < content.length; i++) {
    if (i > 0 && content[i - 1] === content[i]) {
      count++
    }
    if (count !== 0) {
      if (i === content.length) {
        edit = i
      } else if (content[i - 1] !== content[i]) {
        edit = i - 1
      } else {
        continue
      }
      content[edit] = content[edit].replace('Pushed to', `Pushed ${count + 1}x to`)
      while (count > 0) {
        content[edit - count] = ''
        count--
      }
    }
  }
  return content
}

Toolkit.run(
  async tools => {
    const { GIST_ID, GH_USERNAME, GH_PAT } = process.env

    // Get the user's public events
    tools.log.debug(`Getting activity for ${GH_USERNAME}`)
    const events = await tools.github.activity.listPublicEventsForUser({
      username: GH_USERNAME,
      per_page: 100
    })
    tools.log.debug(
      `Activity for ${GH_USERNAME}, ${events.data.length} events found.`
    )

    let content = events.data
      // Filter out any boring activity
      .filter(event => serializers.hasOwnProperty(event.type))
      // Call the serializer to construct a string
      .map(item => serializers[item.type](item))
    cleanupPushes(content)
    content = content
      // Filter out any empty strings (irrelevant events)
      .filter(str => str)
      // We only have five lines to work with
      .slice(0, MAX_LINES)
      // Truncate if necessary
      .map(truncate)
      // Join items to one string
      .join('\n')

    const box = new GistBox({ id: GIST_ID, token: GH_PAT })
    try {
      tools.log.debug(`Updating Gist ${GIST_ID}`)
      await box.update({ content })
      tools.exit.success('Gist updated!')
    } catch (err) {
      tools.log.debug('Error getting or update the Gist:')
      return tools.exit.failure(err)
    }
  },
  {
    event: 'schedule',
    secrets: ['GITHUB_TOKEN', 'GH_PAT', 'GH_USERNAME', 'GIST_ID']
  }
)
