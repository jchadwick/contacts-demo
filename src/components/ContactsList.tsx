import React, { useState } from "react";
import { IoIosAlert as ErrorIcon } from "react-icons/io";
import Popover from "react-tiny-popover";
import { useObserver } from "mobx-react-lite";
import { Contact } from "../model";
import { Loading } from "./Loading";

interface ContactsListProps {
  isLoading?: boolean;
  contacts: Contact[];
  onContactSelected(contact: Contact): void;
  retryContactUpdate(contact: Contact): void;
  selectedContact: Contact;
}

export const ContactsList = ({
  isLoading,
  contacts,
  onContactSelected,
  retryContactUpdate,
  selectedContact
}: ContactsListProps) => {
  return useObserver(() => (
    <ul aria-busy={isLoading} className="contacts contactsList list-group">
      {isLoading ? (
        <Loading />
      ) : (
        contacts.map(contact => (
          <li
            key={contact.id}
            itemScope
            itemType="Contact"
            itemID={String(contact.id)}
            className={`contact list-group-item list-group-item-action ${
              selectedContact === contact ? "active" : ""
            }`}
            onClick={() => onContactSelected(contact)}
          >
            <img alt={contact.displayName} src={contact.profileImageUrl} />
            <div className="content" itemProp="DisplayName">{contact.displayName}</div>
            {contact.status === "error" && (
              <ErrorIndicator
                contact={contact}
                retryContactUpdate={retryContactUpdate}
              />
            )}
            {contact.status === "updating" && (
              <div
                style={{ width: 15, height: 15 }}
                className="pull-right spinner-border text-warning"
                role="status"
              >
                <span className="sr-only">Saving...</span>
              </div>
            )}
          </li>
        ))
      )}
    </ul>
  ));
};

const ErrorIndicator = ({
  contact,
  retryContactUpdate
}: {
  contact;
  retryContactUpdate;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      containerClassName="popover"
      isOpen={isPopoverOpen}
      position="top"
      content={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>Failed to save contact</div>
          <button
            onClick={evt => {
              evt.preventDefault();
              retryContactUpdate(contact);
            }}
            role="button"
            className="btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      }
    >
      <span
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        className="pull-right"
      >
        <ErrorIcon style={{ color: "red" }} />
      </span>
    </Popover>
  );
};
