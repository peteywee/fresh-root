// [P1][TEST][TEST] Test Nextreq tests
// Tags: P1, TEST, TEST
const { NextRequest } = require("next/server");

function inspect(cookieToken, headerToken) {
  const req = new NextRequest("http://localhost/api/test", {
    method: "POST",
    headers: {
      cookie: `csrf-token=${cookieToken}`,
      "x-csrf-token": headerToken,
    },
  });

  console.log("headers entries:", Array.from(req.headers.entries()));
  try {
    console.log("headers.get(cookie):", req.headers.get("cookie"));
  } catch (e) {
    console.log("headers.get(cookie) threw", e);
  }
  console.log("cookies prop:", req.cookies);
  try {
    console.log(
      "cookies.get:",
      typeof req.cookies.get === "function" ? req.cookies.get("csrf-token") : "no-get",
    );
  } catch (e) {
    console.log("cookies.get threw", e);
  }
}

inspect("cookieVal12345", "headerVal67890");
