workflow "Test my code" {
  on = "push"
  resolves = ["codecov"]
}

action "npm ci" {
  uses = "docker://node:10-alpine"
  runs = "npm"
  args = "ci"
}

action "npm test" {
  needs = "npm ci"
  uses = "docker://node:10-alpine"
  runs = "npm"
  args = "test"
}

action "codecov" {
  needs = "npm test"
  uses = "docker://node:10"
  runs = "npx"
  args = "codecov"
  secrets = ["CODECOV_TOKEN"]
}

workflow "Update activity" {
  on = "schedule(*/15 * * * *)"
  resolves = ["update-gist"]
}

action "update-gist" {
  uses = "JasonEtco/activity-box@master"
  secrets = [
    "GITHUB_PAT",
    "GITHUB_USERNAME",
    "GIST_ID"
  ]
}
