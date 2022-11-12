function productionCode(app) {
  const compression = require("compression");
  const helmet = require("helmet");
  const hidePoweredBy = require("hide-powered-by");

  app.use(compression());
  app.use(hidePoweredBy({ setTo: "Replit" }));
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "replit.com/public/js/repl-auth-v2.js",
          "cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js",
        ],
        styleSrc: [
          "'self'",
          "cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/atom-one-dark.min.css",
        ],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    })
  );
}

module.exports = productionCode;
