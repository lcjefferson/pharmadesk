import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Request()
    req: {
      user: {
        userId: string;
        role: UserRole;
        companyId: string | null;
        companyName: string | null;
      };
    },
  ) {
    return this.usersService.create(createUserDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Request()
    req: {
      user: {
        role: UserRole;
        companyId: string | null;
      };
    },
  ) {
    return this.usersService.findAll(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request()
    req: {
      user: {
        role: UserRole;
        companyId: string | null;
      };
    },
  ) {
    return this.usersService.findOne(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request()
    req: {
      user: {
        role: UserRole;
        companyId: string | null;
      };
    },
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request()
    req: {
      user: {
        role: UserRole;
        companyId: string | null;
      };
    },
  ) {
    return this.usersService.remove(id, req.user);
  }
}
