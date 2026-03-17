Deploy this project to GitHub Pages and return the live URL.

Follow these steps in order:

## 1. Check prerequisites

- Check if `git` is installed: `git --version`
- Check if `gh` (GitHub CLI) is installed: `gh --version`. If missing, tell the user to install it from https://cli.github.com and stop.
- Check if the user is authenticated with GitHub CLI: `gh auth status`. If not, run `gh auth login` and wait for the user to complete authentication.

## 2. Get the GitHub username

Run `gh api user --jq '.login'` to get the authenticated GitHub username. Save this as `GITHUB_USER`.

## 3. Determine the repository name

- Check if this directory is already a git repo: `git remote -v`
- If a remote named `origin` exists, extract the repo name from the URL.
- If no remote exists, use the current folder name as the repo name. Run `basename "$PWD"` to get it. Save as `REPO_NAME`.

## 4. Initialize git and create the GitHub repo (if needed)

If the directory is NOT already a git repo:
```bash
git init
git add .
git commit -m "Initial commit"
```

If the GitHub repo does not exist yet, create it:
```bash
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
```

If the repo already exists but has no remote, add it:
```bash
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git push -u origin main
```

## 5. Configure Vite base path for GitHub Pages

GitHub Pages serves the site at `https://<user>.github.io/<repo-name>/`, so Vite needs a matching `base`.

Open `vite.config.ts` and add `base: '/<REPO_NAME>/'` inside `defineConfig({})`, for example:
```ts
export default defineConfig({
  base: '/my-repo-name/',
  // ... rest of config
});
```

Replace `my-repo-name` with the actual `$REPO_NAME` value. Commit this change:
```bash
git add vite.config.ts
git commit -m "Set base path for GitHub Pages"
git push
```

## 6. Install the gh-pages package

Check if `gh-pages` is already in devDependencies in `package.json`. If not:
```bash
npm install --save-dev gh-pages
```

## 7. Add a deploy script to package.json

Add the following script to the `"scripts"` section of `package.json`:
```json
"deploy": "vite build && gh-pages -d build"
```

Note: this project builds to the `build/` directory (configured in `vite.config.ts`).

Commit the change:
```bash
git add package.json
git commit -m "Add GitHub Pages deploy script"
git push
```

## 8. Build and deploy

Run the deploy script:
```bash
npm run deploy
```

This will build the project and push the `build/` folder to the `gh-pages` branch on GitHub.

## 9. Enable GitHub Pages (if first deploy)

After the first deploy, enable GitHub Pages via the API:
```bash
gh api repos/$GITHUB_USER/$REPO_NAME/pages \
  --method POST \
  -f build_type=legacy \
  -f source[branch]=gh-pages \
  -f source[path]=/
```

If this command fails with "already enabled", that's fine — continue.

## 10. Wait and return the live URL

GitHub Pages can take 1–2 minutes to go live after the first deploy.

The live URL will be:
```
https://<GITHUB_USER>.github.io/<REPO_NAME>/
```

Tell the user the exact URL so they can open it in their browser.
Also remind them that if it's their first deploy, it may take a minute or two for the site to become accessible.
