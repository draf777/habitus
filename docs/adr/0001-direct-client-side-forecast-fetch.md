# Fetch the forecast directly from the client, no backend proxy

met.no's Terms of Service ask for an identifying `User-Agent` header, which browsers refuse to let JavaScript set — this reads like it forces a server-side proxy. We tested the real endpoint instead of assuming: it returns `Access-Control-Allow-Origin: *` and accepts plain CORS `GET` requests, and its own ToS says browser clients may identify themselves via `Origin`/`Referer` instead. Given this is a low-volume personal PWA (well under the API's rate limits), we fetch `Locationforecast 2.0` directly from the client and cache each response client-side until the `Expires` header it returns, rather than standing up a backend just to set one header.

If usage ever grows past "low-volume", or the API tightens CORS, this needs a backend proxy — revisit then.
