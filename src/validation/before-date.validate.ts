import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import moment = require("moment");

export function IsBeforeDate(property: string, validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBeforeDateConstraint,
        });
    };
}

@ValidatorConstraint({name: 'IsBeforeDate'})
@Injectable()
export class IsBeforeDateConstraint implements ValidatorConstraintInterface {
    validate(propertyValue: string, args: ValidationArguments) {
        console.log(moment(propertyValue, 'YYYY-MM-DD HH:mm'));
        return moment(propertyValue, 'YYYY-MM-DD HH:mm') < moment(args.object[args.constraints[0]], 'YYYY-MM-DD HH:mm');
    }

    defaultMessage(args: ValidationArguments) {
      return `${args.property} must be before ${args.constraints[0]}`;
    }
}