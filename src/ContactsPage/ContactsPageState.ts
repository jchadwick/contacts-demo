import { Contact } from "../model";
import { observable, computed, action } from "mobx";
import { ContactsService } from "../services/ContactsService";

export class ContactsPageState {
  readonly contacts = observable<Contact>([]);

  @observable filter = "";
  @observable selectedContact: Contact = null;

  @computed
  get filteredContacts(): Contact[] {
    const query = this.filter.toLowerCase();
    return this.contacts.filter(x =>
      (x.displayName || "").toLowerCase().includes(query)
    );
  }

  constructor(
    private readonly contactsService: ContactsService = new ContactsService(
      "http://localhost:8080/contacts"
    )
  ) {}

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
}

