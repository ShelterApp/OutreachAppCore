import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { RegionsService } from "../regions/regions.service";
@ValidatorConstraint({ name: 'RegionValid', async: true })
@Injectable()
export class RegionValidRule implements ValidatorConstraintInterface {
  constructor(private readonly regionService: RegionsService) { }

  async validate(value: string) {
    try {
      const region = await this.regionService.findOne(value);
      if (!region) {
        return false;
      }
      return true;
    } catch(error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} invalid`;
  }
}

export function RegionValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'RegionValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: RegionValidRule,
    });
  };
}