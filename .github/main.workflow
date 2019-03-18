workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
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
