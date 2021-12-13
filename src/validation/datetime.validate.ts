import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment = require("moment");

@ValidatorConstraint({name: 'IsDateTime'})
@Injectable()
export class IsDateTimeConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'string') {
      return  moment(value, 'YYYY-MM-DD HH:mm').isValid();
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid datetime`;
  }
}

export function IsDateTime(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
      registerDecorator({
        name: 'IsDateTime',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: IsDateTimeConstraint,
      });
    };
}