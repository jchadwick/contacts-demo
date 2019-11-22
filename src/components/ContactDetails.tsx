import React from "react";
import { useObserver } from "mobx-react-lite";
import { Contact, AsyncDataStatus } from "../model";
import { StretchBox } from "./StretchBox";
import { Loading } from "./Loading";

interface ContactDetailsProps {
  contact: Contact;
  status?: AsyncDataStatus;
}

export const ContactDetails = ({
  contact,
  status = "init"
}: ContactDetailsProps) =>
  useObserver(() =>
    status === "loading" ? (
      <Loading />
    ) : status === "error" ? (
      <StretchBox>Failed to load contact.</StretchBox>
    ) : contact == null ? (
      <StretchBox>Please select a contact</StretchBox>
    ) : (
      <div className="contactDetails">
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
      </div>
    )
  );
