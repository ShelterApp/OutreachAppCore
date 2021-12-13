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

export enum CampStatus{
    Actived = 1,
    Inactive = 3,
    Lostinsweet = 5
}

export enum CampType {
    Camps = 1,
    CampWithPets = 3,
    RV = 5,
    SafeParking = 7,
    Other = 9,
}

export enum Gender {
    Men = 1,
    Women = 3,
    Uknown = 7
}

export enum Race {
    Unknown = 1
}

export enum Disabled {
    Unknown = 1
}

export enum TransactionType {
    Add = 1,
    Minus = 2,
    Drop = 3
}

export enum AuditLogAction {
    DropSupplies = 'DropSupplies',
    RequestSupplies = 'RequestSupplies',
    JoinEvent = 'JoinEvent'
}

export enum AuditLogType {
    Event = 'Event',
    Camp = 'Camp'
}