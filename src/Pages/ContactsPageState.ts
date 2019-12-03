import { Contact, AsyncDataStatus } from "../model";
import { observable, toJS, reaction } from "mobx";
import defaultContactsService from "../services/ContactsService";

export class ContactsPageState {
  private newContactId = -1;

  readonly contacts = observable<Contact>([]);

  @observable state: AsyncDataStatus = "init";
  @observable filter = "";
  @observable selectedContact: Contact = null;
  @observable newContact: Contact = null;
  @observable selectedContactStatus: AsyncDataStatus = "init";

  constructor(private readonly contactsService = defaultContactsService) {
    reaction(() => this.filter, this.filterContacts);
  }

  private filterContacts = async (filter: string) => {
    const contacts = await this.contactsService.search(filter);
    this.contacts.replace(contacts);
  };

  selectNextContact = () => this.incrementSelectedContactIndex(1);

  selectPreviousContact = () => this.incrementSelectedContactIndex(-1);

  load = async () => {
    this.state = "loading";

    try {
      const contacts = await this.contactsService.getContacts();
      this.contacts.replace(contacts);
      this.state = "ready";
    } catch (ex) {
      this.state = "error";
    }
  };

  initiateNewContact = () =>
    (this.newContact = new Contact({
      // use a local, negative, decrementing id to track it locally
      // until it's replaced with the id from the API after it's saved
      id: this.newContactId--,
      status: "init"
    }));

  cancelNewContact = () => (this.newContact = null);

  retryContactUpdate = async (contact: Contact) => {
    contact.status = "updating";

    const saveContact =
      contact.id > 0
        ? this.contactsService.updateContact
        : this.contactsService.createContact;

    try {
      const toSave = toJS(contact);
      const saved = await saveContact(toSave);
      Object.assign(contact, saved);
      contact.status = "ready";
    } catch (ex) {
      contact.status = "error";
      console.error(`Error saving contact`, ex);
    }
  };

  saveNewContact = async () => {
    const contact = this.newContact;

    contact.status = "updating";

    this.contacts.push(contact);

    this.newContact = null;

    try {
      const toSave = toJS(contact);
      const saved = await this.contactsService.createContact(toSave);
      Object.assign(contact, saved);
      contact.status = "ready";
    } catch (ex) {
      contact.status = "error";
      console.error(`Error saving contact`, ex);
    }
  };

  selectContact = async ({ id }: { id: number }) => {
    if (this.selectedContact && id === this.selectedContact.id) {
      return;
    }

    this.selectedContactStatus = "loading";

    let contact: Contact = null;

    try {
      contact = await this.contactsService.getContact(id);
    } catch (ex) {
      console.warn("Failed to load contact!");
    }

    // if we didn't get one from the server, grab a local one (if we have it)
    if (contact == null) {
      contact = this.contacts.find(x => x.id === id);
    }

    if (contact == null) {
      this.selectedContactStatus = "error";
    } else {
      this.selectedContactStatus = "ready";
      this.selectedContact = contact;
    }
  };

  private incrementSelectedContactIndex = (increment: number) => {
    const contactIndex =
      this.contacts.indexOf(this.selectedContact) + increment;
    this.selectContact(this.contacts[contactIndex]);
  };
}
