import { Controller, Post, Body } from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  createExample(@Body() createExampleDto: CreateExampleDto) {
    return this.exampleService.createExample(createExampleDto);
  }
}