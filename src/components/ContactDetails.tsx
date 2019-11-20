import React from "react";
import { useObserver } from "mobx-react-lite";
import { Contact } from "../model";

interface ContactDetailsProps {
  contact: Contact;
}

export const ContactDetails = ({ contact }: ContactDetailsProps) =>
  useObserver(() => (
    <React.Fragment>
      <img
        alt={contact.displayName}
        src={contact.profileImageUrl}
        className="avatar img-thumbnail"
      />

      <h3 className="displayName">{contact.displayName}</h3>

      <div>
        <label>First Name</label>
        <span>{contact.firstName}</span>
      </div>
      <div>
        <label>Last Name</label>
        <span>{contact.lastName}</span>
      </div>
      <div>
        <label>Date of Birth</label>
        <span>{new Date(contact.dateOfBirth).toLocaleDateString()}</span>
      </div>
      <div>
        <label>Occupation</label>
        <span>{contact.occupation}</span>
      </div>
      <div>
        <label>Email</label>
        <a href={`mailto:${contact.emailAddress}`}>{contact.emailAddress}</a>
      </div>
      <div>
        <label>Phone Number</label>
        <span>
          <a href={contact.phoneNumber}>
            {contact.phoneNumber
              .replace(/\D+/g, "")
              .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
          </a>
        </span>
      </div>
    </React.Fragment>
  ));
