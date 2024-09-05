import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        return getMessagesBetweenUsers(req, res);
    } else if(req.method === 'POST') {
        return createMessage(req, res);
    } else {
        res.setHeader("Allow", ["PUT", "POST"]); // Adjusted to reflect correct method
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function getMessagesBetweenUsers(req, res) {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender Id and Receiver Id are required" });
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function createMessage(req, res) {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ error: "Sender Id and Receiver Id are required" });
    }
    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message content cannot be empty" });
    }
    if (senderId === receiverId) {
        return res.status(400).json({ error: "Sender and receiver cannot be the same user" });
    }

    

    try {
        const isContactExist = await prisma.contacts.findFirst({
            where: {userId: receiverId, contactId: senderId}
        })
        if (isContactExist) {
            console.log('yes the contact exists!')
        } else {
            console.log('Nope you need to create a contact for this!');
            const createContact = await prisma.contacts.create({
                data: {
                    contactId: senderId,
                    userId: receiverId,
                }
            })
            console.log('createdConact======', createContact);
        }
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            }
        });
        return res.status(201).json({ message: "Message added successfully", data: message });
    } catch (err) {
        console.error("Error creating message:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
