# Flood Early Warning Interface

This application is a dashboard for the "Flash" product, that provides
flood risk warnings.

It runs on <customer>.lizard.net/floodsmart/ for customers that use it.


# Development

Install dependencies with `npm install`.

The application needs a backend to run; as a lot of data is required
in the backend, it is usually easiest to talk to the production
environment, but please don't do this for testing functionality that
makes *changes* in the backend (currently, the admin messages
functionality).

Running the application with `npm start` starts it on
`http://localhost:3000`. It runs the webpack dev serve and a proxy.

Without settings, the proxy goes to https://nxt3.staging.lizard.net/
. There will be no authentication, the application will work as
intended for non-authenticated users (the public).

The URL can be changed by setting the `PROXY_URL` environment variable,
and an API key for authentication can be set in the `PROXY_API_KEY` variable.

By also setting `PROXY_PREFIX`, these can be changed; e.g. with
`PROXY_PREFIX=PARRAMATTA`, the `PARRAMATTA_URL` and
`PARRAMATTA_API_KEY` variables are used. This is also an easy way in
general to switch between proxying to production and to staging, or to look at
settings for different customers (provided you have an API key with the correct
authorization for those customers).


# Deployment

As of now, we use release-it to create a distribution on Github, that is deployed
by the `deploy_clients.yml` Ansible script of `lizard-nxt`. Steps:

Make sure the build runs correctly (`npm run build`) and that the
working directory is clean, then run `npm run release`.


# Circumventing CORS problems with the Lizard proxy

We do two types of fetch requests to other servers than Lizard:

- GetFeatureInfo requests to Geoservers

- RSS requests to EWN

If we do these from the browser directly, we run into CORS problems as
these servers do not serve the CORS headers necessary to prevent those
problems.

To circumvent this, we use Lizard's proxy functionality, by sending the request
to `/proxy/<actualy URL>/`. To make this work, two things are needed:

- Configure the URL in Lizard's Proxy list (using the admin interface)

- Ask Ops to whitelist the URL in the outgoing proxy (if it's a domain
  external to N&S).
