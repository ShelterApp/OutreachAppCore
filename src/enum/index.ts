export enum UserRole {
    Admin = 'Admin',
    OrgLead = 'OrgLead',
    Volunteer = 'Volunteer',
}

export enum UserStatus {
    Enabled = 1,
    Disabled = 3
}

export enum UserVerify {
    Verified = 1,
    Unverified = 0,
}

export enum OrganizationStatus {
    Enabled = 1,
    Disabled = 3
}


export enum RequestType {
    UserRequest = 1,
    CampRequest = 3
}

export enum RequestStatus {
    Open = 1,
    Claim = 3,
    Archive = 5,
    Delete = 7
}

export enum SupplyStatus {
    Enabled = 1,
    Disabled = 3
}

export enum SupplyItemStatus {
    Enabled = 1,
    Disabled = 3
}