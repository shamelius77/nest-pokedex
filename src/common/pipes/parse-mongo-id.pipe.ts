import { ArgumentMetadata, HttpException, Injectable, PipeTransform, HttpStatus } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {

    if( !isValidObjectId(value)){
        throw new HttpException(`${value} no es un mongoId Valido`, HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}
