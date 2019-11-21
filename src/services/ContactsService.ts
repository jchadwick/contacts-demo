import { Contact } from "../model";
import { RestfulService } from "./RestfulService";

interface AutoSuggestResult {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

export class ContactsService extends RestfulService {
  createContact = async (contact: Omit<Contact, "id">) => {
    const saved = await $.ajax({
      url: this.baseUrl,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(contact)
    });

    return new Contact(saved);
  };

  deleteContact = (contactId: number) => this.delete(contactId);

  getContact = (contactId: number) =>
    this.get(contactId).then(x => x.map(y => new Contact(y)));

  getContacts = () => this.get().then(x => x.map(y => new Contact(y)));

  suggest = (query: string) =>
    this.get<AutoSuggestResult[]>(["suggest", query]);

  updateContact = ({ id, ...updated }: { id: number } & Partial<Contact>) =>
    this.patch<Contact>(id, updated).then(x => new Contact(x));
}

export default new ContactsService("http://localhost:8080/contacts");
