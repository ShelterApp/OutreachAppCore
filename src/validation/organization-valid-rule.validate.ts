import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { OrganizationsService } from "src/organizations/organizations.service";
import { AuthService } from "../auth/auth.service";

@ValidatorConstraint({ name: 'OrganizationValid', async: true })
@Injectable()
export class OrganizationValidRule implements ValidatorConstraintInterface {
  constructor(private readonly organizationsService: OrganizationsService) { }

  async validate(value: string) {
    const user = await this.organizationsService.findByCode(value);
    if (!user) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property}_invalid`;
  }
}

export function OrganizationValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'OrganizationValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: OrganizationValidRule,
    });
  };
}