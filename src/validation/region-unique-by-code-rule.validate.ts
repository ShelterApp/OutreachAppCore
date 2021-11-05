import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { RegionsService } from "../regions/regions.service";
@ValidatorConstraint({ name: 'RegionUniqueByCode', async: true })
@Injectable()
export class RegionUniqueByCodeRule implements ValidatorConstraintInterface {
  constructor(private readonly regionService: RegionsService) { }

  async validate(value: string) {
    const region = await this.regionService.findByCode(value);
    if (!region) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is exsist`;
  }
}

export function RegionUniqueByCode(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'RegionUniqueByCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: RegionUniqueByCodeRule,
    });
  };
}