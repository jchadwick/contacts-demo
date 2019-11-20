import React from "react";
import { useObserver } from "mobx-react-lite";
import { ContactsPageState } from "./ContactsPageState";
import { useEventListener, useStore } from "../hooks";
import { ContactsSearchBar } from "../components/ContactsSearchBar";
import { ContactsList } from "../components/ContactsList";
import { ContactDetails } from "../components/ContactDetails";
import "./ContactsPage.css";

export const ContactsPage = () => {
  const store = useStore(ContactsPageState);

  useEventListener(
    "keyup",
    React.useCallback(
      function keyHandler({ key }) {
        switch (key) {
          case "ArrowUp":
            store.selectPreviousContact();
            break;
          case "ArrowDown":
            store.selectNextContact();
            break;
        }
      },
      [store]
    )
  );

  React.useEffect(() => {
    store.load();
  }, [store]);

  return useObserver(() => (
    <div id="app">
      <h1 className="text-center">My Contacts</h1>

      <div className="contactsPage card">
        <div className="contactsSearchBar">
          <ContactsSearchBar
            filter={store.filter}
            onFilterChanged={filter => (store.filter = filter)}
          />
        </div>
        <div className="contactsList">
          <ContactsList
            contacts={store.filteredContacts}
            onContactSelected={contact => (store.selectedContact = contact)}
            selectedContact={store.selectedContact}
          />
        </div>
        <div className="contactDetails">
          {store.selectedContact == null ? (
            <div>Please select a contact</div>
          ) : (
            <ContactDetails contact={store.selectedContact} />
          )}
        </div>
      </div>
    </div>
  ));
};
