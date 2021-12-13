import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment = require("moment");

export function IsDate(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            name: 'IsDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsDateConstraint,
          });
    };
}

@ValidatorConstraint({name: 'IsDate'})
@Injectable()
export class IsDateConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value === 'string') {
      return /^[1-9]\d*-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && moment(value, 'YYYY-MM-DD').isValid();
    }
    return false;
  }

  defaultMessage({ property }) {
    return `${property} must be a valid date`;
  }
}