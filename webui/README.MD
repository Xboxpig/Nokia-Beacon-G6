# The WebUI

The WebUI is hosted on the usual ports 80 and 443.

There exist two accounts: admin and superadmin. Attempting to log in with the 'root' user causes 
a `is_hacker` (???) flag to be enabled in the server's side. No idea what it does.

The WebUI communicates with the backend server through sending GET and POST requests to .cgi endpoints. 
You can find a list of all of them in [admin-accessible-endpoints.md](./admin-accessible-endpoints.md)

You can also get access to more configuration options. Instructions are available 
[here](../tutorials/more-webui-options/README.MD)


On previous editions of the Nokia Beacon router series, the POST payload was sent in plain text
([source](https://spaceraccoon.dev/nokia-beacon-router-uart-command-injection/)), but more recent routers 
like this one encrypt the POST payload with a public key retrieved during login and stored in localStorage


