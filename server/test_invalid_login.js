import http from "http";

async function test() {
  const data = JSON.stringify({ email: "invalid@bad.com", password: "wrong", role: "student" });
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };
  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => body += chunk);
    res.on("end", () => console.log("Status:", res.statusCode, "Body:", body));
  });
  req.write(data);
  req.end();
}
test();
