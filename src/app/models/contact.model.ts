export class ContactModel {
    id!: string;
    contact_id!: string;
    first_name!: string;
    email!: string;
    phone_number!: string;
    subject!: string;
    message!: string;
    created_at!: Date;
    status: string = 'PENDING';

    // Additional fields for UI state management
    isExpanded!: boolean;
    isDeleting!: boolean;
}