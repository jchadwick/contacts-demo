import { RouteComponentProps } from "@reach/router";
import { useObserver } from "mobx-react-lite";
import React from "react";
import { IoMdAdd as AddIcon } from "react-icons/io";
import { ContactDetails } from "../components/ContactDetails";
import { ContactsList } from "../components/ContactsList";
import { ContactsSearchBar } from "../components/ContactsSearchBar";
import { useEventListener, useStore } from "../hooks";
import { AddNewContactDialog } from "./AddNewContactDialog";
import { ContactsPageState } from "./ContactsPageState";
import { StretchBox } from "../components/StretchBox";
import { Loading } from "../components/Loading";
import "./ContactsPage.css";

export const ContactsPage = (_: RouteComponentProps) => {
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
    <>
      <header className="row">
        <h2 className="title col-md-9">My Contacts</h2>

        <div className="col-md-3 text-right">
          <button
            className="pull-right btn btn-sm btn-primary"
            onClick={store.initiateNewContact}
          >
            <AddIcon />
            Add Contact
          </button>
        </div>
      </header>

      {store.state === "loading" ? (
        <Loading />
      ) : store.state === "error" ? (
        <StretchBox>
          <div className="text-danger">Failed to load contacts</div>
          <div>
            <button
              className="btn btn-xlg btn-primary"
              onClick={() => store.load()}
            >
              Retry
            </button>
          </div>
        </StretchBox>
      ) : (
        <div className="contactsPage card">
          <>
            <ContactsSearchBar
              filter={store.filter}
              onFilterChanged={filter => (store.filter = filter)}
            />
            <ContactsList
              contacts={store.contacts}
              onContactSelected={store.selectContact}
              retryContactUpdate={store.retryContactUpdate}
              selectedContact={store.selectedContact}
            />
            <ContactDetails
              status={store.selectedContactStatus}
              contact={store.selectedContact}
            />
          </>
        </div>
      )}

      {store.newContact && (
        <AddNewContactDialog
          contact={store.newContact}
          onSave={store.saveNewContact}
          onCancel={store.cancelNewContact}
        />
      )}
    </>
  ));
};
