<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/10660468/54499151-062f8900-48e5-11e9-82c9-767d39c9cbbe.png">
  <h3 align="center">activity-box</h3>
  <p align="center">⚡️📌 Update a pinned gist to contain the latest activity of a user</p>
</p>

<p align="center"><a href="https://github.com/JasonEtco/activity-box"><img alt="GitHub Actions status" src="https://github.com/JasonEtco/activity-box/workflows/Node%20CI/badge.svg"> <a href="https://codecov.io/gh/JasonEtco/activity-box/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/activity-box" alt="Codecov"></a></p>

---

## Setup

**activity-box** is a GitHub Action that is designed to work using the [`schedule`](https://developer.github.com/actions/managing-workflows/creating-and-cancelling-a-workflow/#scheduling-a-workflow) event.

### Prep work

1. Create a new public GitHub Gist (https://gist.github.com/)
2. [Generate new token](https://github.com/settings/tokens/new) with the `gist` scope and copy it. The `GITHUB_TOKEN` that comes with GitHub Actions cannot currently use the Gist API.

### Project setup

1. Fork this repo

2. Create a secret by going to **Forked repo > Settings > Secrets > New secret** with the following:
- Name: Use `GH_PAT`.
- Value: The token with the `gist` scope generated previously.

3. Open the file `.github/workflows/activity.yml` which looks like this:

```yml
name: Activity Box

on:
  schedule:
    - cron: '*/10 * * * *'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      - uses: JasonEtco/activity-box@master
        env:
          GH_PAT: ${{ secrets.GH_PAT }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GH_USERNAME: JasonEtco
          GIST_ID: 123abc
```

4. Edit the [environment variables](.github/workflows/activity.yml#L15-L18):

- **GIST_ID:** The ID portion from your gist url `https://gist.github.com/JasonEtco/`**`6d5f84419863089a167387da62dd7081`**.
- **GH_USERNAME:** The username handle of your GitHub account.

5. 💰 Profit
---

_Inspired by [matchai/bird-box](https://github.com/matchai/bird-box)_