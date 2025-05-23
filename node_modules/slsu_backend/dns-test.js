const dns = require("dns");
dns.resolveSrv(
  "_mongodb._tcp.cluster0.7h9e3ox.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.error("DNS lookup failed:", err);
    } else {
      console.log("DNS lookup succeeded:", addresses);
    }
  }
);
