import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

import * as URLSafeBase64 from 'urlsafe-base64';
import * as webpush from 'web-push';

import * as vapidKeys from '@config/vapid-keys.json';

webpush.setVapidDetails(
  'mailto:example@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  openUrl: string;
  data: {
    url: string;
  };
}

interface DataSubscription {
  id: string;
  subscription: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    email: string;
  };
}

@Injectable()
export class NotificationsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async subscribe({
    subscription,
    currentUser,
  }: {
    subscription: string;
    currentUser: User;
  }): Promise<{ message: string }> {
    await this.subscription.create({
      data: {
        subscription,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    return { message: 'Subscription created' };
  }

  getKey(): string {
    return URLSafeBase64.decode(vapidKeys.publicKey);
  }

  async push(): Promise<{
    message: string;
  }> {
    const subscriptions = await this.subscription.findMany({
      where: {
        user: {
          isActive: true,
        },
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (subscriptions.length) {
      console.log({
        size: subscriptions.length,
      });
      subscriptions.forEach((dataSubscription) => {
        const options = {
          title: 'Notification! by server',
          body: 'This is a test notification',
          //icon: '/img/logos/delfos-isologotipo-dataservice-vertical.svg',
          //badge: '/img/logos/delfos-isologotipo-dataservice-vertical.svg',
          openUrl: '/',
          data: {
            //url: '/supports?id=5196',
            url: '/supports',
          },
        };

        this.sendNotification(dataSubscription, options);
      });
    }

    return {
      message: 'Push sent',
    };
  }

  sendNotification(
    dataSubscription: DataSubscription,
    options: NotificationOptions,
  ): void {
    const subscription = JSON.parse(dataSubscription.subscription);

    webpush
      .sendNotification(subscription, JSON.stringify(options))
      .then(() => {
        this.logger.debug(
          `Notification sent to email: "${dataSubscription.user.email}"`,
        );
      })
      .catch(async (err) => {
        this.logger.error(err);

        if (err.statusCode === 410) {
          console.log({
            id: dataSubscription.id,
          });

          await this.subscription.update({
            where: {
              id: dataSubscription.id,
            },
            data: {
              isActive: false,
            },
          });
        }
      });
  }
}
