Hello! 
Since you are using Vite, the best place to put downloadable static files is in the `public` directory, not `src`. 
Files in `src` are meant to be imported into your code and compiled by Vite.
Files placed in `public` are served exactly as they are.

So, when you have your extension's `dist` folder ready, zip it up and name it `aullevo-extension.zip`.
Then place that zip file directly in this folder (`public/download/`).

The download links in the Navbar and Home page are already configured to look for:
`/download/aullevo-extension.zip`
