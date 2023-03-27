import express from "express";
import bcrypt from "bcrypt";
import {
  genPassword,
  createAdmin,
  getWebcode,
  getAdminByName,
  updateAdminPassword,
  createWebcode,
  getWebcodeById,
  EditTask,
  EditWeb,
  getCapstone,
  getCapstoneById,
  Editcapstone,
  createCapstone,
} from "../controller.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const isuserExist = await getAdminByName(email);

  if (isuserExist) {
    res.status(400).send({ message: "Username already taken" });
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
  await createAdmin(firstname, lastname, email, hashedPassword);
  res.send({ status: "ok" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getAdminByName(email);

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
    const email = user.email;
    getAdminByName(email)
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

const { authemail, authpassword } = process.env;

router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await getAdminByName(email);
    
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
      const link = `https://student-dashboard-ubi2.onrender.com/admin/reset-password/${oldUser.email}/${token}`;
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
      console.log(link);
    }
  } catch (error) {}
});

router.get("/reset-password/:email/:token", async (req, res) => {
  const { email, token } = req.params;
  const oldUser = await getAdminByName(email);

  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = process.env.SECRET_KEY + oldUser.password;

  try {
    const verify = jwt.verify(token, secret);

    res.render("index", { email: verify.email, status: "not verified" });
  } catch (error) {
    res.send("Not Verified");
    console.log(err);
  }
});

router.post("/reset-password/:email/:token", async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;

  const oldUser = await getAdminByName(email);
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
    await updateAdminPassword(email, hashedPassword);

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});

//webcode

router.post("/webcode", async (req, res) => {
  try {
    const { id, title, marks } = req.body;
    const dataexist = await getWebcodeById(id);
    if (dataexist) {
      res.send({ message: "choose differnt id" });
    } else {
      await createWebcode(id, title, marks);
      res.send({ status: "ok" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/webcode", async (req, res) => {
  try {
    const details = await getWebcode(req);
    res.send(details);
  } catch (err) {
    console.log(err);
  }
});

router.get("/webcode/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const details = await getWebcodeById(id);
    res.send(details);
  } catch (err) {
    console.log(err);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updatedtask = req.body;

  try {
    await EditTask(id, updatedtask);
    res
      .status(200)
      .json({ message: "successfully updated", data: updatedtask });
  } catch {
    res.status(404).json({ message: "failed to update" });
  }
});

router.put("/webcode/:id", async (req, res) => {
  const { id } = req.params;
  const updatedweb = req.body;
  try {
    await EditWeb(id, updatedweb);
    res.status(200).json({ message: "successfully updated", data: updatedweb });
  } catch {
    res.status(404).json({ message: "failed to update" });
  }
});

//capstone

router.post("/capstone", async (req, res) => {
  try {
    const { id, title, marks } = req.body;
    const dataexist = await getCapstoneById(id);
    if (dataexist) {
      res.send({ message: "choose differnt id" });
    } else {
      await createCapstone(id, title, marks);
      res.send({ status: "ok" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/capstone", async (req, res) => {
  try {
    const details = await getCapstone(req);
    res.send(details);
  } catch (err) {
    console.log(err);
  }
});

router.get("/capstone/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const details = await getCapstoneById(id);
    res.send(details);
  } catch (err) {
    console.log(err);
  }
});

router.put("/capstone/:id", async (req, res) => {
  const { id } = req.params;
  const updatedcap = req.body;
  try {
    await Editcapstone(id, updatedcap);
    res.status(200).json({ message: "successfully updated", data: updatedcap });
  } catch {
    res.status(404).json({ message: "failed to update" });
  }
})

export const adminRouter = router;
