import { Contact, NotificationType, AsyncDataStatus } from "../model";
import { observable, computed } from "mobx";
import defaultContactsService from "../services/ContactsService";

export class ContactsPageState {
  readonly contacts = observable<Contact>([]);

  @observable state: AsyncDataStatus = "init";
  @observable filter = "";
  @observable selectedContact: Contact = null;
  @observable newContact: Contact = null;
  @observable notification: { message: string; type: NotificationType } = null;
  @observable selectedContactStatus: AsyncDataStatus = "init";

  @computed
  get filteredContacts(): Contact[] {
    const query = this.filter.toLowerCase();
    return this.contacts.filter(x =>
      (x.displayName || "").toLowerCase().includes(query)
    );
  }

  constructor(private readonly contactsService = defaultContactsService) {}

  clearNotification = () => (this.notification = null);

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

  initiateNewContact = () => (this.newContact = new Contact());

  cancelNewContact = () => (this.newContact = null);

  saveNewContact = async () => {
    try {
      const savedContact = await this.contactsService.createContact(
        this.newContact
      );

      this.contacts.push(savedContact);
      this.newContact = null;

      this.displayNotification(
        `Saved new contact ${savedContact.displayName}`,
        "success"
      );
    } catch (ex) {
      this.displayError(ex);
    }
  };

  displayNotification = (message: string, type: NotificationType = "info") => {
    console.debug(`[${type}] ${message}`);
    this.notification = { message, type };
  };

  displayError = error => {
    let notification: string = null;

    if (typeof error === "string") {
      notification = error;
    } else {
      const { message, responseText } = error || {};
      notification = message || responseText || JSON.stringify(error);
    }

    this.displayNotification(notification, "danger");
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
      console.error("Failed to load contact!");
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
      this.filteredContacts.indexOf(this.selectedContact) + increment;
    this.selectedContact = this.filteredContacts[contactIndex];
  };
}
