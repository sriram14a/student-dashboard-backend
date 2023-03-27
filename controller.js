import { client } from "./index.js";
import bcrypt from "bcrypt";

//password
export async function genPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function updatePassword(email, hashedPassword) {
  return await client
    .db("password")
    .collection("user")
    .updateOne({ email: email }, { $set: { password: hashedPassword } });
}
export async function updateAdminPassword(email, hashedPassword) {
  return await client
    .db("password")
    .collection("admin")
    .updateOne({ email: email }, { $set: { password: hashedPassword } });
}

//admin
export async function createAdmin(firstname, lastname, email, hashedPassword) {
  return await client.db("password").collection("admin").insertOne({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: hashedPassword,
  });
}

export async function getAdminByName(email) {
  return await client
    .db("password")
    .collection("admin")
    .findOne({ email: email });
}

export async function getAdminById(email) {
  
  return await client
    .db("password")
    .collection("admin")
    .find({ email })
    .toArray();
}

//webcode

export async function createWebcode(id, title, marks) {
  return await client.db("password").collection("webcode").insertOne({
    id: id,
    title: title,
    marks: marks,
  });
}

export async function getWebcode(req) {
  return await client
    .db("password")
    .collection("webcode")
    .find(req.query)
    .toArray();
}

export async function getWebcodeById(id) {
  return await client.db("password").collection("webcode").findOne({ id: id });
}

//user

export async function getStudents(req) {
  return await client
    .db("password")
    .collection("user")
    .find(req.query)
    .toArray();
}

export async function createUser(firstname, lastname, email, hashedPassword) {
  return await client.db("password").collection("user").insertOne({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: hashedPassword,
  });
}

export async function getUserByName(email) {
  return await client
    .db("password")
    .collection("user")
    .findOne({ email: email });
}

export async function getUserById(email) {
  
  return await client
    .db("password")
    .collection("user")
    .find({ email })
    .toArray();
}

export async function taskInsert(tasks, link, marks, id, email) {
  return await client.db("password").collection("tasks").insertOne({
    tasks: tasks,
    link: link,
    marks: marks,
    id: id,
    email: email,
  });
}

export async function webInsert(sourcecode, deploy, marks, id, email, title) {
  return await client.db("password").collection("web").insertOne({
    sourcecode: sourcecode,
    deploy: deploy,
    marks: marks,
    id: id,
    email: email,
    title: title,
  });
}

export async function getTask(id) {
  return await client.db("password").collection("tasks").findOne({ id: id });
}

export async function getTaskByname(email) {
  return await client
    .db("password")
    .collection("tasks")
    .find({ email: email })
    .toArray();
}
export async function getwebByname(email) {
  return await client
    .db("password")
    .collection("web")
    .find({ email: email })
    .toArray();
}

export async function updateTask(id, link) {
  return await client
    .db("password")
    .collection("tasks")
    .updateOne({ id: id }, { $set: { link: link } });
}

export async function getWeb(id) {
  return await client.db("password").collection("web").findOne({ id: id });
}

export async function updateWeb(id, sourcecode, deploy) {
  return await client
    .db("password")
    .collection("web")
    .updateOne(
      { id: id },
      { $set: { sourcecode: sourcecode, deploy: deploy } }
    );
}

export async function EditTask(id, updatedtask) {
  return await client
    .db("password")
    .collection("tasks")
    .updateOne({ id: id }, { $set: updatedtask });
}

export async function EditWeb(id, updatedweb) {
  return await client
    .db("password")
    .collection("web")
    .updateOne({ id: id }, { $set: updatedweb });
}

//capstone

export async function createCapstone(id, title, marks) {
  return await client.db("password").collection("capstone").insertOne({
    id: id,
    title: title,
    marks: marks,
  });
}

export async function getCapstone(req) {
  return await client
    .db("password")
    .collection("capstone")
    .find(req.query)
    .toArray();
}

export async function getCapstoneById(id) {
  return await client.db("password").collection("capstone").findOne({ id: id });
}

export async function Editcapstone(id, updatedcap) {
  return await client
    .db("password")
    .collection("cap")
    .updateOne({ id: id }, { $set: updatedcap });
}

export async function getCap(id) {
  return await client.db("password").collection("cap").findOne({ id: id });
}

export async function updateCap(id, sourcecode, deploy) {
  return await client
    .db("password")
    .collection("cap")
    .updateOne(
      { id: id },
      { $set: { sourcecode: sourcecode, deploy: deploy } }
    );
}

export async function capInsert(sourcecode, deploy, marks, id, email, title) {
  return await client.db("password").collection("cap").insertOne({
    sourcecode: sourcecode,
    deploy: deploy,
    marks: marks,
    id: id,
    email: email,
    title: title,
  });
}

export async function getCapByname(email) {
  return await client
    .db("password")
    .collection("cap")
    .find({ email: email })
    .toArray();
}

export async function CreatePortfolio(git, portfolio, resume, email) {
  return await client.db("password").collection("portfolio").insertOne({
    git: git,
    portfolio: portfolio,
    resume: resume,
    email: email,
  });
}

export async function getPortfolio(req) {
  return await client
    .db("password")
    .collection("portfolio")
    .find(req.query)
    .toArray();
}

export async function getPort(email) {
  return await client
    .db("password")
    .collection("portfolio")
    .findOne({ email: email });
}

export async function updateport(email,git, portfolio, resume) {
  return await client
    .db("password")
    .collection("portfolio")
    .updateOne(
      { email: email },
      { $set: { git: git, portfolio: portfolio, resume: resume } }
    );
}
