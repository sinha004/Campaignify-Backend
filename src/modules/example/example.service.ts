import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
    createExample(data: any): any {
        // Business logic for creating an example
        return { message: 'Example created successfully', data };
    }

    // Additional methods can be added here
}