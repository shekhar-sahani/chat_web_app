import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      console.log("user", user);

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            {
              expiresIn: "7d",
            }
          );
          res.setHeader(
            "Set-Cookie",
            serialize("authToken", token, {
              httpOnly: false,
              secure: false,
              maxAge: 7 * 24 * 60 * 60,
              path: "/",
            })
          );
          return res.status(200).json({
            message: "Login successful",
            userId: user.id,
            username: user.username,
          });
        } else {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        const token = jwt.sign(
          { userId: newuser.id, username: newuser.username },
          JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        res.setHeader(
          "Set-Cookie",
          serialize("authToken", token, {
            httpOnly: false,
            secure: false,
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
          })
        );
        return res.status(201).json({
          message: "User created successfully",
          userId: newuser.id,
          username: newuser.username,
        });
      }
    } catch (err) {
      console.log("err", err);
      return res.status(500).json({ message: "Interal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
