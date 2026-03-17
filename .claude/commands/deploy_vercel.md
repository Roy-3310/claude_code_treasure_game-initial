Deploy this project to Vercel and return the live URL.

Follow these steps:

1. Check if the Vercel CLI is installed by running `vercel --version`. If not installed, run `npm install -g vercel` to install it globally.

2. Run `npm run build` to make sure the project builds successfully before deploying.

3. Check if the user is already logged in to Vercel by running `vercel whoami`. If not logged in, run `vercel login` and wait for the user to authenticate.

4. Deploy to Vercel by running:
   ```
   vercel --yes
   ```
   Use `--yes` to accept all default prompts automatically.

5. For a **production deployment**, run:
   ```
   vercel --prod --yes
   ```

6. After deployment completes, extract and display the production URL from the output (it looks like `https://<project-name>.vercel.app`).

7. Tell the user the live URL so they can open it in the browser.

Note: If this is the first deploy, Vercel may ask to link the project. Run `vercel link --yes` first if needed, or use `vercel --yes` which handles project setup interactively.
