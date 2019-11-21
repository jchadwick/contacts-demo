import { Contact } from "../model";
import React from "react";
import { action, toJS, reaction } from "mobx";
import { useObserver } from "mobx-react-lite";

interface AddNewContactDialogProps {
  contact?: Contact;
  onSave(contact: Contact): void;
  onCancel(): void;
}

export const AddNewContactDialog = ({
  contact = new Contact(),
  onSave,
  onCancel
}: AddNewContactDialogProps) => {
  return useObserver(() => (
    <div className="modal fade show" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Contact</h5>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={onCancel}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              <FormField label="First Name" model={contact} name="firstName" />
              <FormField label="Last Name" model={contact} name="lastName" />
              <FormField
                label="Email Address"
                model={contact}
                name="emailAddress"
                type="email"
              />
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSave(contact)}
            >
              Save changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  ));
};

const FormField = ({ label, model, name, field = "value", ...props }) =>
  useObserver(() => (
    <div className="form-group">
      <label>{label}</label>
      <input
        className="form-control"
        placeholder={label}
        {...props}
        value={model[name] || ""}
        onChange={evt => (model[name] = evt.target[field])}
      />
    </div>
  ));
