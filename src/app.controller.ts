import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/auth')
  getAuth(@Headers('token') token: string) {
    if (token !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }
    return {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
  }
  @Post('/login')
  login(@Body() body: { username: string; password: string }) {
    return this.appService.login(body.username, body.password);
  }

  @Get('/mails')
  getMails(@Headers('token') token: string) {
    if (token !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }
    return this.appService.getAllMails();
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post('/mails')
  postMails(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
    @Headers('token') token: string,
  ) {
    if (token !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException(
        'You are not authorized to access this resource',
      );
    }
    return this.appService.sendEmail(body, files);
  }
}
