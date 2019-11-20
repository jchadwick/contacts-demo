type DateString = string;
type PhoneNumberString = string;
type EmailAddressString = string;
type UrlString = string;

export class Contact {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: DateString;
  phoneNumber?: PhoneNumberString;
  emailAddress?: EmailAddressString;
  occupation?: string;
  profileImageUrl?: UrlString;

  constructor(source?: Partial<Contact>) {
    Object.assign(this, source);
  }
}
