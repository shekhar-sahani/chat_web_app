import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    return createContact(req, res);
  } else if(req.method === 'PUT') {
    return getUserContacts(req, res);
  } else {
    res.setHeader("Allow", ["POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createContact(req, res) {
  const { userId, username } = req.body;

  if (!userId || !username) {
    return res
      .status(400)
      .json({ message: "User ID and username are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userId === user.id) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a contact" });
    }

    const existingContact = await prisma.contacts.findUnique({
      where: {
        userId_contactId: {
          userId: userId,
          contactId: user.id,
        },
      },
    });

    if (existingContact) {
      return res.status(409).json({ message: "Contact already exists" });
    }

    const createContactForUser = await prisma.contacts.create({
      data: {
        userId: userId,
        contactId: user.id,
      },
      include: {
        contact: {select: {id: true, socketID: true}}
      }
    });

    const createContactForReceiver = await prisma.contacts.create({
      data: {
        userId: user.id,
        contactId: userId
      }
    })

    

    return res
      .status(201)
      .json({ message: "Contact created successfully for both user and receiver", data: createContactForUser });
  } catch (err) {
    console.error("Error creating contact:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserContacts(req, res) {
  const { userId } = req.body;
  console.log('enterd')
  console.log('userId', userId)
  if (!userId) return res.status(200).json({ message: "User id is requried" });
  try {
      const userConacts = await prisma.contacts.findMany(
        { where: { userId },
        include: {
            contact: {select: {username: true, id: true, socketID: true, isOnline: true}}
        } 
    });
      return res.status(200).json({userConacts});
      

  } catch (err) {
    console.log('err')
    return res.status(500).json({message: "Internal server error"})
  }

}
