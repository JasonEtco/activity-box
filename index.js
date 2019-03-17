require('dotenv').config()
const Octokit = require('@octokit/rest')

const {
  GIST_ID,
  GITHUB_USERNAME,
  GITHUB_TOKEN
} = process.env

const octokit = new Octokit({
  auth: `token ${GITHUB_TOKEN}`
})

const capitalize = str => str.slice(0, 1).toUpperCase() + str.slice(1)
const truncate = str => str.length <= 46 ? str : str.slice(0, 43) + '...'

const serializers = {
  IssueCommentEvent: item => {
    return `Commented on #${item.payload.issue.number} in ${item.repo.name}`
  },
  IssueEvent: item => {
    return `${capitalize(item.payload.action)} issue #${item.payload.issue.number} in ${item.repo.name}`
  },
  PullRequestEvent: item => {
    return `${capitalize(item.payload.action)} PR #${item.payload.pull_request.number} in ${item.repo.name}`
  }
}

async function main() {
  // Get the user's public events
  const events = await octokit.activity.listPublicEventsForUser({ username: GITHUB_USERNAME, per_page: 100 })

  const serialized = events.data
    // Filter out any boring activity
    .filter(event => serializers.hasOwnProperty(event.type)).slice(0, 5)
    // Call the serializer to construct a string
    .map(item => serializers[item.type](item))
    // Truncate if necessary
    .map(truncate)

  // Create one string with multiple lines
  const content = serialized.join('\n')

  // Update the Gist
  return updateGist(content)
}

async function updateGist(content) {
  let gist
  try {
    gist = await octokit.gists.get({ gist_id: GIST_ID })
  } catch (error) {
    console.error(`Unable to get gist\n${error}`)
  }
  // Get original filename to update that same file
  const filename = Object.keys(gist.data.files)[0]

  try {
    await octokit.gists.update({
      gist_id: GIST_ID,
      files: {
        [filename]: { content }
      }
    })
  } catch (error) {
    console.error(`Unable to update gist\n${error}`)
  }
}

(async () => {
  await main()
})()
