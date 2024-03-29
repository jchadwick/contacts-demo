import React from "react";
import { useObserver } from "mobx-react-lite";

interface ContactsSearchBarProps {
  filter: string;
  onFilterChanged(query: string): void;
}

export const ContactsSearchBar = ({
  filter,
  onFilterChanged
}: ContactsSearchBarProps) =>
  useObserver(() => (
    <div className="contactsSearchBar">
      <input
        type="text"
        name="contacts-search-bar"
        className="form-control"
        placeholder="Search Contacts"
        value={filter}
        onChange={evt => onFilterChanged(evt.currentTarget.value)}
      />
    </div>
  ));
