import { Contact } from "../model";
import { RestApi } from "./RestApi";

interface AutoSuggestResult {
  id: string;
  displayName: string;
  profileImageUrl: string;
}

export class ContactsService {
  private readonly api: RestApi;

  constructor(baseUrl: string) {
    this.api = new RestApi(baseUrl);
  }

  createContact = (contact: Omit<Contact, "id">) =>
    this.api.post<Contact>("", contact).then(x => new Contact(x));

  deleteContact = (contactId: number) => this.api.delete(contactId);

  getContact = (contactId: number) =>
    this.api.get(contactId).then(x => x.map(y => new Contact(y)));

  getContacts = () => this.api.get().then(x => x.map(y => new Contact(y)));

  suggest = (query: string) =>
    this.api.get<AutoSuggestResult[]>(["suggest", query]);

  updateContact = ({ id, ...updated }: { id: number } & Partial<Contact>) =>
    this.api.post<Contact>(id, updated).then(x => new Contact(x));
}

