import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    currentUser: {
      userId: string;
      role: UserRole;
      companyId: string | null;
      companyName: string | null;
    },
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    let companyId = currentUser.companyId;
    let companyName = currentUser.companyName;

    if (currentUser.role === UserRole.SUPERADMIN) {
      if (createUserDto.companyName && createUserDto.companyName.trim()) {
        companyName = createUserDto.companyName.trim();
        companyId = companyName.toLowerCase().replace(/\s+/g, '-');
      }
    }

    if (currentUser.role !== UserRole.SUPERADMIN) {
      if (!companyId) {
        throw new ConflictException(
          'Usuário atual não possui empresa associada',
        );
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      companyId: companyId ?? null,
      companyName: companyName ?? null,
    });

    const savedUser = await this.usersRepository.save(user);
    // @ts-expect-error password is intentionally omitted from response
    delete savedUser.password;
    return savedUser;
  }

  async findAll(currentUser: {
    role: UserRole;
    companyId: string | null;
  }): Promise<User[]> {
    if (currentUser.role === UserRole.SUPERADMIN) {
      return this.usersRepository.find();
    }
    if (!currentUser.companyId) {
      return [];
    }
    return this.usersRepository.find({
      where: { companyId: currentUser.companyId },
    });
  }

  async findOne(
    id: string,
    currentUser?: { role: UserRole; companyId: string | null },
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (currentUser && currentUser.role !== UserRole.SUPERADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name', 'companyId'], // Explicitly select password
    });
  }

  async createInitialAdmin(): Promise<User> {
    const adminEmail = 'admin@pharmadesk.com';
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const user = this.usersRepository.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      companyId: 'pharmadesk',
      companyName: 'PharmaDesk',
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: { role: UserRole; companyId: string | null },
  ): Promise<User> {
    const user = await this.findOne(id, currentUser);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);
    // @ts-expect-error password is intentionally omitted from response
    delete savedUser.password;
    return savedUser;
  }

  async remove(
    id: string,
    currentUser?: { role: UserRole; companyId: string | null },
  ): Promise<void> {
    const user = await this.findOne(id, currentUser);
    await this.usersRepository.remove(user);
  }
}
