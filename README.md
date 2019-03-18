<p align="center">
  <img width="400" src="https://user-images.githubusercontent.com/10660468/54499151-062f8900-48e5-11e9-82c9-767d39c9cbbe.png">
  <h3 align="center">activity-box</h3>
  <p align="center">⚡️📌 Update a pinned gist to contain the latest activity of a user</p>
</p>

<p align="center"><a href="https://action-badges.now.sh"><img src="https://action-badges.now.sh/JasonEtco/activity-box" /></a> <a href="https://codecov.io/gh/JasonEtco/activity-box/"><img src="https://badgen.now.sh/codecov/c/github/JasonEtco/activity-box" alt="Codecov"></a></p>

---

## Setup

### Prep work

1. Create a new public GitHub Gist (https://gist.github.com/)
2. Create a token with the `gist` scope and copy it. (https://github.com/settings/tokens/new)

### Project setup

1. Fork this repo
2. Log into CircleCI with your GitHub (https://circleci.com/vcs-authorize/)
3. Click on "Add Projects" on the sidebar
4. Set up a project with the newly created fork
5. Go to Project Settings > Environment Variables
6. Add the following environment variables:

- **GIST_ID:** The ID portion from your gist url `https://gist.github.com/matchai/`**`6d5f84419863089a167387da62dd7081`**.
- **GITHUB_TOKEN:** The GitHub token generated above.
- **GITHUB_USERNAME:** The username handle of the GitHub account.

---

_Inspire by [matchai/bird-box](https://github.com/matchai/bird-box)_