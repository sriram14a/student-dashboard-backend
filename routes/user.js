import express from "express";
import bcrypt from "bcrypt";
import {
  genPassword,
  createUser,
  getUserByName,
  getStudents,
  taskInsert,
  webInsert,
  updatePassword,
  getTask,
  updateTask,
  getTaskByname,
  getWeb,
  updateWeb,
  getwebByname,
  EditTask,
  getCap,
  getCapByname,
  updateCap,
  capInsert,
  CreatePortfolio,
  getPortfolio,
  updateport,
  getPort,
} from "../controller.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  const mentor = await getStudents(req);
  res.send(mentor);
});

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const isuserExist = await getUserByName(email);

  if (isuserExist) {
    res.status(400).send({ message: "Username Already Exists" });
    return;
  }

  if (
    !/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(
      password
    )
  ) {
    res.status(400).send({
      message: "Password strength",
    });
    return;
  }

  const hashedPassword = await genPassword(password);
  await createUser(firstname, lastname, email, hashedPassword);
  res.send({ status: "ok" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByName(email);

  if (!user) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }
  const userPassword = user.password;
  const isPasswordMatch = await bcrypt.compare(password, userPassword);
  if (!isPasswordMatch) {
    res.status(400).send({ message: "Invalid Credentials" });
    return;
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
    process.env.SECRET_KEY
  );

  res.send({ message: "Successfully login", data: token });
});

router.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    const useremail = user.email;
    getUserByName(useremail)
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

router.post("/userdata/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    const data = await getUserByName(email);
    res.send({ status: "ok", data: data });
  } catch (error) {}
});

const { authemail, authpassword } = process.env;

router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await getUserByName(email);

    if (!oldUser) {
      return res.json({ status: "User Not Exists" });
    } else {
      const secret = process.env.SECRET_KEY + oldUser.password;

      const token = jwt.sign(
        { email: oldUser.email, id: oldUser._id },
        secret,
        {
          expiresIn: "5m",
        }
      );
      const link = `https://student-dashboard-ubi2.onrender.com/user/reset-password/${oldUser.email}/${token}`;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: authemail,
          pass: authpassword,
        },
      });

      var mailOptions = {
        from: authemail,
        to: oldUser.email,
        subject: "Password Reset",
        text: link,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.send({ status: "ok" });
      
    }
  } catch (error) {}
});

router.get("/reset-password/:email/:token", async (req, res) => {
  const { email, token } = req.params;
  const oldUser = await getUserByName(email);
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.SECRET_KEY + oldUser.password;

  try {
    const verify = jwt.verify(token, secret);

    res.render("index", { email: verify.email, status: "not verified" });
  } catch (error) {
    res.send("Not Verified");
  }
});

router.post("/reset-password/:email/:token", async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;

  const oldUser = await getUserByName(email);
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }

  const secret = process.env.SECRET_KEY + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);

    if (
      !/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/g.test(
        password
      )
    ) {
      res.render("index", { email: verify.email, status: "password" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await updatePassword(email, hashedPassword);

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

router.post("/tasks", async (req, res) => {
  const { tasks, link, marks, id, email } = req.body;
  const isuserExist = await getUserByName(email);

  if (isuserExist) {
    const isdataexist = await getTask(id);
   
    if (isdataexist) {
      const updated = await updateTask(id, link);
      res.status(200).json({ message: "successfully inserted" });
    } else {
      await taskInsert(tasks, link, marks, id, email);
      try {
        res.status(200).json({ message: "successfully inserted" });
      } catch {
        res.status(404).json({ message: "failed to update" });
      }
    }
  }
});

router.get("/tasks/:email", async (req, res) => {
  const { email } = req.params;
  const tasks = await getTaskByname(email);
  res.send(tasks);
});

router.post("/webcode", async (req, res) => {
  const { sourcecode, deploy, marks, id, email, title } = req.body;

  const isdataexist = await getWeb(id);
  
  if (isdataexist) {
    const updated = await updateWeb(id, sourcecode, deploy);
    res.status(200).json({ message: "successfully inserted" });
  } else {
    await webInsert(sourcecode, deploy, marks, id, email, title);
    try {
      res.status(200).json({ message: "successfully inserted" });
    } catch {
      res.status(404).json({ message: "failed to update" });
    }
  }
});

router.get("/webcode/:email", async (req, res) => {
  const { email } = req.params;
  const tasks = await getwebByname(email);

  res.send(tasks);
});

router.post("/capstone", async (req, res) => {
  const { sourcecode, deploy, marks, id, email, title } = req.body;

  const isdataexist = await getCap(id);
  console.log(isdataexist);
  if (isdataexist) {
    const updated = await updateCap(id, sourcecode, deploy);
    res.status(200).json({ message: "successfully inserted" });
  } else {
    await capInsert(sourcecode, deploy, marks, id, email, title);
    try {
      res.status(200).json({ message: "successfully inserted" });
    } catch {
      res.status(404).json({ message: "failed to update" });
    }
  }
});

router.get("/capstone/:email", async (req, res) => {
  const { email } = req.params;
  const tasks = await getCapByname(email);

  res.send(tasks);
});

router.get("/portfolio/:email", async (req, res) => {
  const { email } = req.params;
  
  const tasks = await getPort(email);
console.log(tasks)
  res.send(tasks);
});

router.post("/portfolio", async (req, res) => {
  const { git, portfolio, resume, email } = req.body;
  const port = await getPort(email);
  
  if (port) {
   await updateport(email, git, portfolio, resume);

    res.status(200).json({ status: "ok" });
  } else {
    await CreatePortfolio(git, portfolio, resume, email);
    try {
      res.status(200).json({ message: "successfully inserted" });
    } catch {
      res.status(404).json({ message: "failed to update" });
    }
  }
});

router.get("/portfolio", async (req, res) => {
  const tasks = await getPortfolio(req);
  res.send(tasks);
});

export const usersRouter = router;
