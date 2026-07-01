import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@/database/entities/notification.entity';
import { GroupModule } from '@/modules/group/group.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationMapper } from './notification.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), GroupModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationMapper],
  exports: [NotificationService],
})
export class NotificationModule {}
