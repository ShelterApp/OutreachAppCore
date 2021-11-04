import { IsString, IsEmail, IsNumber, Validate, IsNotEmpty, isEnum, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserVerify } from '../../enum';
import { Organization } from '../../organizations/schema/organization.schema';
import { OrganizationValidById } from 'src/validation/organization-validbyid-rule.validate';
export class UpdateProfileDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "OutStreach", description: 'The name of person', required: true })
    name: string;

    @IsString()
    @ApiProperty({ example: "099999999", description: 'The phone of person', required: true })
    phone: string;

    @IsOptional()
    @IsMongoId()
    @OrganizationValidById()
    @ApiProperty({ example: "id organization", description: 'Org', required: false })
    organization: Organization
}