import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { OrganizationsService } from "../organizations/organizations.service";
@ValidatorConstraint({ name: 'OrganizationValidById', async: true })
@Injectable()
export class OrganizationValidByIdRule implements ValidatorConstraintInterface {
  constructor(private readonly organizationsService: OrganizationsService) { }

  async validate(value: string) {
    try {
      const org = await this.organizationsService.findById(value);
      if (!org) {
        return false;
      }
      return true;
    } catch(error) {
      
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} invalid`;
  }
}

export function OrganizationValidById(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'OrganizationValidById',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: OrganizationValidByIdRule,
    });
  };
}