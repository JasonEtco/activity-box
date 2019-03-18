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
