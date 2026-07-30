# Deployment

This app is a Next.js server app because invoice extraction runs through `app/api/extract`.

Domovanje/cPanel deployment needs a Node.js runtime for:

- `npm ci`
- `npm run build`
- `OPENAI_API_KEY`
- starting the app with `npm start` or `.next/standalone/server.js`

The static checkout flow used by `webcams` is not enough for this app because
`webcams` is plain HTML/CSS/JS, while this app has a server API route.

The local deployment helper mirrors the existing git-push workflow:

```bash
./deploy.sh
```

That pushes `main` to the `production` git remote. The server still needs Node
application hosting enabled and configured to run the built app.
