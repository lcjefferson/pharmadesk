import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = appContext.get(UsersService);

    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'superadmin123';

    const user = await usersService.create(
      {
        name: 'Super Admin',
        email,
        password,
        role: UserRole.SUPERADMIN,
      },
      {
        userId: 'seed-script',
        role: UserRole.SUPERADMIN,
        companyId: null,
        companyName: null,
      },
    );

    // eslint-disable-next-line no-console
    console.log('Superadmin criado com sucesso:', user.email);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao criar superadmin:', error);
  } finally {
    await appContext.close();
  }
}

void bootstrap();

