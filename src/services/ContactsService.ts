import { Contact } from "../model";
import { RestfulService } from "./RestfulService";

interface AutoSuggestResult {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

export class ContactsService extends RestfulService {
  createContact = async (contact: Omit<Contact, "id">) =>
    fetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(contact),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    } as any)
      .then(resp => (resp.json() as unknown) as Contact)
      .then(x => new Contact(x));

  deleteContact = (contactId: number) => this.delete(contactId);

  getContact = (contactId: number) =>
    $.ajax([this.baseUrl, contactId].join("/")).then(y =>
      y == null ? null : new Contact({ ...y, status: "ready" })
    );

  getContacts = () =>
    this.get().then(x => x.map(y => new Contact({ ...y, status: "ready" })));

  search = (query: string) =>
    this.get([`?q=${query}`]).then(x =>
      x.map(y => new Contact({ ...y, status: "ready" }))
    );

  suggest = (query: string) =>
    this.get<AutoSuggestResult[]>(["suggest", query]);

  updateContact = ({ id, ...updated }: { id: number } & Partial<Contact>) =>
    this.patch<Contact>(id, updated).then(x => new Contact(x));
}

export default new ContactsService("http://localhost:8080/contacts");
