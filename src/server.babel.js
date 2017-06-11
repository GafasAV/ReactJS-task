import path from "path";
import mime from "mime-types";
import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import * as config from "../webpack.config.js";

// prevent default configuration loading
delete config['default']

// app preferences
const app           = express(),
      DIST_DIR      = path.join(__dirname, "../dist"),
      HTML_FILE     = path.join(DIST_DIR, "index.html"),
      isDevelopment = process.env.NODE_ENV !== "production",
      DEFAULT_PORT  = 3000,
      compiler      = webpack(config);

app.set("port", process.env.PORT || DEFAULT_PORT);

/*
In development mode load resourses from Webpack dev server;
In production mode load resourses from 'dist' folder;
 */
if (isDevelopment) {
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }));

  app.use(webpackHotMiddleware(compiler));

  app.get("*", (req, res, next) => {
    compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
      if (err) {
        return next(err);
      }
      console.log(req.originalUrl);
      console.log(HTML_FILE);
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    });
  });
}

else {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res) => res.sendFile(HTML_FILE));
}

app.listen(app.get("port"), () => { console.log(`Server listening on: ${process.env.PORT || DEFAULT_PORT}\nMode: ${process.env.NODE_ENV}`) });
