import http from "http";

const API_BASE_HOST = "localhost";
const API_BASE_PORT = 5000;

function post(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: API_BASE_HOST,
      port: API_BASE_PORT,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log("Starting Auth Tests...");

  try {
    // 1. Test Admin Login
    console.log("\nTesting Admin Login...");
    const adminLogin = await post("/api/auth/login", { email: "admin@pms.com", password: "admin123", role: "admin" });
    console.log("Admin Login Status:", adminLogin.status);
    console.log("Admin Login Data:", JSON.stringify(adminLogin.data, null, 2));

    // 2. Test Student Registration
    console.log("\nTesting Student Registration...");
    const studentReg = await post("/api/auth/register", { 
      name: "Test Student", 
      email: `student_${Date.now()}@test.com`, 
      password: "password123", 
      role: "student",
      cgpa: 8.5
    });
    console.log("Student Reg Status:", studentReg.status);
    console.log("Student Reg Data:", JSON.stringify(studentReg.data, null, 2));

    // 3. Test Company Registration
    console.log("\nTesting Company Registration...");
    const companyReg = await post("/api/auth/register", { 
      name: "Test Company", 
      email: `company_${Date.now()}@test.com`, 
      password: "password123", 
      role: "company",
      description: "Test description"
    });
    console.log("Company Reg Status:", companyReg.status);
    console.log("Company Reg Data:", JSON.stringify(companyReg.data, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
