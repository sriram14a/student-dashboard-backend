// import jwt from "jsonwebtoken";

// export const auth = (req, res, next,oldUser) => {
//   try {
//     const token = req.header("x-auth-token");
//     console.log(token);
//     jwt.verify(token, process.env.SECRET_KEY+ oldUser.password);
//     console.log(oldUser)
//     next();
//   } catch (err) {
//     res.send({ error: err.message });
//   }
// };