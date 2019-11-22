import React from "react";
import { useObserver } from "mobx-react-lite";
import { Contact } from "../model";

interface ContactsListProps {
  contacts: Contact[];
  onContactSelected(contact: Contact): void;
  selectedContact: Contact;
}

export const ContactsList = ({
  contacts,
  onContactSelected,
  selectedContact
}: ContactsListProps) =>
  useObserver(() => (
    <ul className="contactsList list-group">
      {contacts.map(contact => (
        <li
          key={contact.id}
          className={`list-group-item list-group-item-action ${
            selectedContact === contact ? "active" : ""
          }`}
          onClick={() => onContactSelected(contact)}
        >
          <img alt={contact.displayName} src={contact.profileImageUrl} />
          <div>{contact.displayName}</div>
        </li>
      ))}
    </ul>
  ));
