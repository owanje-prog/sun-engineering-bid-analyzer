@AGENTS.md

앞으로 파일을 수정할때마다 깃에 커밋하고 푸시해줘.
나는 비개발자이니까 코드를 설명할때도 쉬운 비유와 함께 친절히 설명해줘
코드 수정하고 잘 돌아가는지 테스트해줘, 그리고 잘 돌아갈 때까지 너가 편집해줘
사극체 쓰지마

# gstack

Installed at `~/.claude/skills/gstack` (cloned from https://github.com/garrytan/gstack).

## Web browsing

**Use the `/browse` skill from gstack for all web browsing.** Never use `mcp__claude-in-chrome__*` tools.

## Available skills

`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`,
`/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`,
`/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`,
`/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`,
`/setup-gbrain`, `/retro`, `/investigate`, `/document-release`,
`/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`,
`/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`,
`/gstack-upgrade`, `/learn`

## Windows notes

- Skills are installed as file **copies**, not symlinks. Re-run
  `~/.claude/skills/gstack/setup` after every `git pull` to refresh them.
- `/connect-chrome` ships as a symlink alias to `/open-gstack-browser`, which
  does not survive a Windows checkout — use `/open-gstack-browser` instead.