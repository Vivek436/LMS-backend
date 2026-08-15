import { Injectable } from '@nestjs/common';

export interface PaymentNotification {
    student: {
        name: string;
        email: string;
    };
    course: {
        title: string;
        price: number;
    };
    instructor: {
        name: string;
        email: string;
    } | null;
    paymentDate: Date;
    paymentReference: string;
}

@Injectable()
export class NotificationsService {
    // In-memory storage for notifications (replace with database in production)
    private notifications: Array<{
        id: string;
        type: 'payment_success';
        recipient: 'admin' | 'instructor';
        recipientId?: string;
        data: PaymentNotification;
        read: boolean;
        createdAt: Date;
    }> = [];

    async sendPaymentSuccessNotification(notification: PaymentNotification) {
        // Create notification for admin
        this.notifications.push({
            id: `notif_${Date.now()}_admin`,
            type: 'payment_success',
            recipient: 'admin',
            data: notification,
            read: false,
            createdAt: new Date(),
        });

        // Create notification for instructor if exists
        if (notification.instructor) {
            this.notifications.push({
                id: `notif_${Date.now()}_instructor`,
                type: 'payment_success',
                recipient: 'instructor',
                recipientId: notification.instructor.email,
                data: notification,
                read: false,
                createdAt: new Date(),
            });
        }

        // Log to console (in production, send email/SMS/push notification)
        console.log('\n=== PAYMENT SUCCESS NOTIFICATION ===');
        console.log(`Student: ${notification.student.name} (${notification.student.email})`);
        console.log(`Course: ${notification.course.title}`);
        console.log(`Amount: ₹${notification.course.price}`);
        console.log(`Payment Date: ${notification.paymentDate}`);
        console.log(`Reference: ${notification.paymentReference}`);
        if (notification.instructor) {
            console.log(`Instructor: ${notification.instructor.name} (${notification.instructor.email})`);
        }
        console.log('Notified: Admin' + (notification.instructor ? ' & Instructor' : ''));
        console.log('=====================================\n');

        return {
            success: true,
            message: 'Notifications sent successfully',
            recipients: ['admin', notification.instructor ? 'instructor' : null].filter(Boolean),
        };
    }

    async getNotifications(recipient: 'admin' | 'instructor', recipientId?: string) {
        return this.notifications
            .filter(n => {
                if (n.recipient !== recipient) return false;
                if (recipient === 'instructor' && recipientId) {
                    return n.recipientId === recipientId;
                }
                return true;
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async markAsRead(notificationId: string) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
        return { success: true };
    }

    async getUnreadCount(recipient: 'admin' | 'instructor', recipientId?: string) {
        const notifications = await this.getNotifications(recipient, recipientId);
        return notifications.filter(n => !n.read).length;
    }
}
