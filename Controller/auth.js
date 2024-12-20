const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../db/db.js");
const nodemailer = require("nodemailer");

require("dotenv").config();
const router = express.Router();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
transport.verify((error, success) => {
  if (error) {
    console.error("Error with transport setup:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

router.post("/addEmployee", async (req, res) => {
  const {
    firstName,
    lastName,
    employee_id,
    email,
    phone_number,
    department,
    date_of_joining,
    roles,
  } = req.body;
  
  try {
    const connectDB = await connection();

    const [existingEmp] = await connectDB.query(
      "SELECT * FROM employee_details WHERE employee_id = ?",
      [employee_id]
    );

    if (existingEmp.length) {
      return res.status(401).json({ message: "Employee with this ID already exists." });
    }

    await connectDB.query(
      "INSERT INTO employee_details (first_name, last_name, employee_id, email, phone_number, department, date_of_joining, roles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, employee_id, email, phone_number, department, date_of_joining, roles]
    );

    res.status(200).json({ message: "Employee details successfully added!" });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "New Employee Registration",
      text: `${firstName} ${lastName} has registered as a new Employee`,
      html: `<h1>Hello from CIT Employee Form</h1><p>New employee details...</p><ul><li><span>Employee ID:</span>${employee_id}</li><li><span>Department:</span>${department}</li><li><span>Role:</span>${roles}</li><li><span>Mobile Number:</span>${phone_number}</li></ul>`,
    };

    transport.sendMail(mailOptions, (err, result) => {
      if (err) {
        console.error("Error while sending mail", err.message);
      } else {
        console.log(`Email sent successfully to ${email}`, result.response);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error while adding a new employee" });
  }
});

router.get("/getEmployee", async (req, res) => {
  try {
    const connectDB = await connection();
    const [result] = await connectDB.query("SELECT * FROM employee_details");
    if (result.length == 0) {
      return res.status(400).json({ message: "No Data is given Yet!" });
    } else {
      return res.status(200).json(result);
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error caught" });
  }
});
router.delete("/deleteEmployee/:id", async (req, res) => {
  const employeeId = req.params.id;
  try {
      const connectDB = await connection();
      const [checkEmployee] = await connectDB.query("SELECT * FROM employee_details WHERE id = ?", [employeeId]);

      if (checkEmployee.length === 0) {
          return res.status(404).json({ message: "Employee not found." });
      }

      const [result] = await connectDB.query("DELETE FROM employee_details WHERE id = ?", [employeeId]);

      if (result.affectedRows === 1) {
          return res.status(200).json({ message: "Employee deleted successfully." });
      } else {
          return res.status(500).json({ message: "Failed to delete the employee." });
      }
  } catch (err) {
      console.error("Error during deletion:", err);
      return res.status(500).json({ message: "An error occurred while deleting the employee." });
  }
});


module.exports = router;
