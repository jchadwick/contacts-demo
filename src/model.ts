import { observable } from "mobx";

type DateString = string;
type PhoneNumberString = string;
type EmailAddressString = string;
type UrlString = string;

export type AsyncDataStatus = "init" | "loading" | "ready" | "error";

export type NotificationType =
  | "info"
  | "primary"
  | "secondary"
  | "success"
  | "danger";

export class Contact {
  readonly id: number = null;
  @observable displayName: string = "";
  @observable firstName: string = "";
  @observable lastName: string = "";
  @observable dateOfBirth?: DateString = "";
  @observable phoneNumber?: PhoneNumberString = "";
  @observable emailAddress?: EmailAddressString = "";
  @observable occupation?: string = "";
  @observable profileImageUrl?: UrlString = "";

  constructor(source?: Partial<Contact>) {
    Object.assign(this, source || {});
  }
}
