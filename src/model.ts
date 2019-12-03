import { observable, computed } from "mobx";

type DateString = string;
type PhoneNumberString = string;
type EmailAddressString = string;
type UrlString = string;

export type AsyncDataStatus =
  | "init"
  | "loading"
  | "updating"
  | "ready"
  | "error";

export type NotificationType =
  | "info"
  | "primary"
  | "secondary"
  | "success"
  | "danger";

export class Contact {
  @observable id: number = null;
  @observable firstName: string = "";
  @observable lastName: string = "";
  @observable dateOfBirth?: DateString = "";
  @observable phoneNumber?: PhoneNumberString = "";
  @observable emailAddress?: EmailAddressString = "";
  @observable occupation?: string = "";
  @observable profileImageUrl?: UrlString = "";
  @observable status?: AsyncDataStatus = "init";

  @computed
  get displayName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(source?: Partial<Contact>) {
    Object.assign(this, source || {});
  }
}
