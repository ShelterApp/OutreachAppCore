export class CreateAuditlogDto {
    userId: string;
    orgId: string;
    action: string;
    objectId: string;
    type: string;
    items: CreateAuditlogItem[];
    message: string;
    createdAt: Date;
}

export class CreateAuditlogItem {
    name: string;
    qty: number;
}