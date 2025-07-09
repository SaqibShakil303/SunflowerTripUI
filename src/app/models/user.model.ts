export class UserModel {
    id?: number;
    email?: string;
    passwordHash?: string;
    googleId?: string;
    role?: string;
    createdAt?: Date;
    truecallerId?: string;
    refreshToken?: string;

    // Additional field for UI state management
    isDeleting?: boolean;
}