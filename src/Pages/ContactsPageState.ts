import { Contact } from "../model";
import { observable, computed, action } from "mobx";
import defaultContactsService from "../services/ContactsService";

export class ContactsPageState {
  readonly contacts = observable<Contact>([]);

  @observable filter = "";
  @observable selectedContact: Contact = null;
  @observable newContact: Contact = null;
  @observable error: string = null;

  @computed
  get filteredContacts(): Contact[] {
    const query = this.filter.toLowerCase();
    return this.contacts.filter(x =>
      (x.displayName || "").toLowerCase().includes(query)
    );
  }

  constructor(private readonly contactsService = defaultContactsService) {}

  clearError = () => (this.error = null);

  selectNextContact = () => this.incrementSelectedContactIndex(1);

  selectPreviousContact = () => this.incrementSelectedContactIndex(-1);

  load = async () => {
    const contacts = await this.contactsService.getContacts();
    console.debug("Loaded contacts", contacts);
    this.contacts.replace(contacts);
  };

  private incrementSelectedContactIndex = (increment: number) => {
    const contactIndex =
      this.filteredContacts.indexOf(this.selectedContact) + increment;
    this.selectedContact = this.filteredContacts[contactIndex];
  };

  @action
  initiateNewContact = () => (this.newContact = new Contact());

  @action
  cancelNewContact = () => (this.newContact = null);

  saveNewContact = async () => {
    console.debug("Saving new contact", this.newContact);

    try {
      const savedContact = await this.contactsService.createContact(
        this.newContact
      );

      this.contacts.push(savedContact);
      this.newContact = null;
      console.debug("Saved contact", savedContact);
    } catch (ex) {
      this.showError(ex);
    }
  };

  showError = error =>
    (this.error =
      error && (error.message ? error.message : JSON.stringify(error)));
}
