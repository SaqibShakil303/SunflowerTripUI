export class LocationModel {
    id?: number;
    destination_id?: number;
    destination_ids?: number[];
    name?: string;
    description?: string;
    image_url?: string;
    iframe_360?: string;

    // Additional fields for UI state management
    showDetails?: boolean;
    isDeleting?: boolean;
}