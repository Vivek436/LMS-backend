import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get notifications for admin or instructor' })
    async getNotifications(
        @Query('recipient') recipient: 'admin' | 'instructor',
        @Query('recipientId') recipientId?: string,
    ) {
        return this.notificationsService.getNotifications(recipient, recipientId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async getUnreadCount(
        @Query('recipient') recipient: 'admin' | 'instructor',
        @Query('recipientId') recipientId?: string,
    ) {
        const count = await this.notificationsService.getUnreadCount(recipient, recipientId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }
}
