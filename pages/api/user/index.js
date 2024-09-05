import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { io } from "socket.io-client";

const newSocket = io('http://localhost:3001/')

export default function handler(req, res) {
  if (req.method === "GET") {
    return getAllUers(req, res);
  } else if (req.method === 'PUT') {
    return getUserSocketID(req, res);
  } else if (req.method === "POST") {
    return updateUser(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} not allowed `);
  }
}

async function getAllUers(req, res) {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { userId, socketID, isOnline } = body;
    console.log('data from body=====', req.body);
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: { socketID, isOnline  },
      select: {username: true, isOnline: true, socketID: true}
    });
    res.status(201).json(user);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserSocketID(req, res) {
    const {receiverId} = req.body;

    try {
    const user = await prisma.user.findUnique({
        where: {
            id: receiverId,
        },
        select: {socketID: true}
    })   
    if (user && user.socketID) {
        const socketID = user.socketID
        return res.status(200).json({socketID})
    } else {
        return res.status(400).json({message:'User has no socket id'});
    }
    } catch (er) {
        console.log('err', err);
        res.status(500).json({error:'Internal server error'})
    }

}
