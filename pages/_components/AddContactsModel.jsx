import { useRef } from 'react';
import UseCookieData from '../../lib/useCookieData';
import { useSocket } from '../../context/socketContext';


export default function AddContactModel({userId, getContacts}) {
  const userNameRef = useRef();
  const {socket} = useSocket();

  function hideModel() {
    document.getElementById("addContactModel").close();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const tokenData = await UseCookieData();
    console.log('tokenData', tokenData.userId);

    const value = userNameRef.current.value;
    if (value === '') {
      return alert("Username can't be empty");
    }

    const jsonData = { userId: tokenData.userId, username: value };

    try {
      const res = await fetch('/api/contacts', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });

      const resData = await res.json();
      console.log('contact_added_response====', resData);
      if (res.ok) {
        const {id, socketID} = resData.data.contact;
        console.log("data=====", id, socketID);
        document.getElementById("addContactModel").close();
        alert('Contact added successfully!');
        socket.emit('add-contact', {receiverId: id, socketID});
        await getContacts(userId)
      } else {
        alert(resData.message);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while adding the contact.');
    } finally {
      console.log('fasdf')
      userNameRef.current.value = '';
    }
  }

  return (
    <dialog id="addContactModel" className="modal">
      <div className="modal-box">
        <button
          onClick={hideModel}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Add Contact!</h3>
        <p className="py-4">Enter username to add that contact</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus={true}
            ref={userNameRef}
            type="text"
            className="input focus-visible:outline-none w-full input-bordered"
            placeholder="Enter username"
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-ghost">
              Submit
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
