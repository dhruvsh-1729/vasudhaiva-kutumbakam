import { prisma } from './prisma';
import { NotificationReceipt } from '@prisma/client';

type NotificationInput = {
  title: string;
  body: string;
  createdById?: string | null;
  targetAll?: boolean;
  targetAdminOnly?: boolean;
  targetInstitutions?: string[];
  targetUserIds?: string[];
};

export async function createNotification(input: NotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      body: input.body,
      targetAll: input.targetAll ?? true,
      targetAdminOnly: input.targetAdminOnly ?? false,
      targetInstitutions: input.targetInstitutions ?? [],
      targetUserIds: input.targetUserIds ?? [],
      createdById: input.createdById ?? null,
    },
  });

  // Pre-create receipts for targeted users if provided
  if (input.targetUserIds && input.targetUserIds.length > 0) {
    const receipts = input.targetUserIds.map((userId) => ({
      notificationId: notification.id,
      userId,
    }));
    await prisma.notificationReceipt.createMany({
      data: receipts,
      skipDuplicates: true,
    });
  }

  return notification;
}

export async function fetchNotificationsForUser(
  userId: string,
  institution?: string | null,
  isAdmin = false
): Promise<Array<NotificationReceipt & { notification: { title: string; body: string } }>> {
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { targetAll: true, targetAdminOnly: false },
        { targetAdminOnly: isAdmin },
        { targetUserIds: { has: userId } },
        institution
          ? {
              targetInstitutions: {
                has: institution,
              },
            }
          : undefined,
      ].filter(Boolean) as any,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      targetAdminOnly: true,
      targetAll: true,
    },
  });

  // Ensure receipts exist
  await prisma.notificationReceipt.createMany({
    data: notifications.map((n) => ({ notificationId: n.id, userId })),
    skipDuplicates: true,
  });

  const receipts = await prisma.notificationReceipt.findMany({
    where: { userId, notificationId: { in: notifications.map((n) => n.id) } },
    include: { notification: { select: { title: true, body: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return receipts;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await prisma.notificationReceipt.upsert({
    where: { notificationId_userId: { notificationId, userId } },
    create: { notificationId, userId, isRead: true, readAt: new Date() },
    update: { isRead: true, readAt: new Date() },
  });
}
