import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import AddContactModel from "./AddContactsModel";
import { useSocket } from "../../context/socketContext";
import UseCookieData from "../../lib/useCookieData";

export default function SidePannel({
  setContactId,
  userData,
  contactId,
  setContactSocketID,
  setShowChatPanel,
  setContactName,
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [userName, setUserName] = useState();
  const userId = userData.userId;
  const [onlinerUsers, setOnlineUsers] = useState([]);
  const { socket } = useSocket();
  console.log("userData", userData);

  function handleLogout() {
    socket.emit("user-disconnected", userId);
    Cookie.remove("authToken");
    localStorage.clear();
    router.push("/login");
  }

  function handleSelectContact(contact) {
    localStorage.setItem("activeChat", JSON.stringify(contact));
    setContactId(contact.id);
    setContactName(contact.username);
    setShowChatPanel(true);
    setContactSocketID(contact.socketID);
  }

  async function getContacts(userId) {
    try {
      console.log("userId-------->", userId);
      const res = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const resData = await res.json();
        console.log("contactss------>", resData.userConacts);
        setContacts(resData.userConacts);
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  async function getContactBySocketCall(users) {
    const { userId } = UseCookieData();
    try {
      console.log("userId-------->", userId);
      const res = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const resData = await res.json();
        var contacts = resData.userConacts;

        const updatedContacts = contacts?.map((contact) => ({
          ...contact,
          contact: {
            ...contact.contact,
            isOnline: users.some((user) => user.userId === contact.contactId),
          },
        }));

        setContacts(updatedContacts);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err.message);
    }
  }

  useEffect(() => {
    if (!socket) return;

    const handleGetOnlineUsers = async (users) => {
      console.log("onlineUsers------>", users);
      await getContactBySocketCall(users);
    };

    socket.on("getOnlineUsers", handleGetOnlineUsers);

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("getOnlineUsers", handleGetOnlineUsers);
    };
  }, [socket]);

  useEffect(() => {
    if (userData) {
      setUserName(userData.username);
      getContacts(userData.userId);
    }
  }, [userData]);

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-800 text-gray-100">
      <div className="flex items-center justify-between gap-4 border-b border-gray-700 pb-2">
        <div className="avatar placeholder">
          <div className="bg-gray-700 text-gray-100 w-16 rounded-full">
            <span className="text-xl uppercase">{userName?.charAt(0)}</span>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <h1 className="text-xl font-semibold truncate">{userName}</h1>
          <div className="dropdown dropdown-bottom dropdown-end ">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost m-1 text-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-gray-900 rounded-box z-[1] w-52 p-2 shadow-lg text-gray-100"
            >
              <li
                onClick={() =>
                  document.getElementById("addContactModel").showModal()
                }
              >
                <a>Add Contact</a>
              </li>
              <li>
                <a onClick={handleLogout}>Log out</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto py-6">
        {contacts?.map((data, id) => (
          <div
            onClick={() => handleSelectContact(data.contact)}
            key={id}
            className={`py-2 px-2 flex cursor-pointer items-center gap-3 rounded-lg transition duration-200 ${
              data.contact.id === contactId
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-800 hover:bg-gray-800 text-gray-100"
            }`}
          >
            <div
              className={`avatar ${
                data.contact.isOnline && "online"
              } placeholder`}
            >
              <div className="bg-gray-700 text-gray-100 w-12 rounded-full">
                <span className="text-xl uppercase">
                  {data.contact.username.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <h1 className="text-lg font-medium">{data.contact.username}</h1>
            </div>
          </div>
        ))}
      </div>

      <AddContactModel getContacts={getContacts} userId={userId} />
    </div>
  );
}
