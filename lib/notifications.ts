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
    // Check which receipts already exist
    const existingReceipts = await prisma.notificationReceipt.findMany({
      where: {
        notificationId: notification.id,
        userId: { in: input.targetUserIds },
      },
      select: { userId: true },
    });
    
    const existingUserIds = new Set(existingReceipts.map(r => r.userId));
    const newReceipts = input.targetUserIds
      .filter(userId => !existingUserIds.has(userId))
      .map((userId) => ({
        notificationId: notification.id,
        userId,
      }));
    
    if (newReceipts.length > 0) {
      await prisma.notificationReceipt.createMany({
        data: newReceipts,
      });
    }
  }

  return notification;
}

export async function fetchNotificationsForUser(
  userId: string,
  institution?: string | null,
  isAdmin = false
): Promise<Array<NotificationReceipt & { notification: { title: string; body: string } }>> {
  // Build the query conditions based on user type
  const orConditions: any[] = [];

  // 1. Notifications for everyone (not admin-only)
  orConditions.push({
    targetAll: true,
    targetAdminOnly: false,
  });

  // 2. Notifications specifically for admins (only if user is admin)
  if (isAdmin) {
    orConditions.push({
      targetAdminOnly: true,
    });
  }

  // 3. Notifications targeted to this specific user
  orConditions.push({
    targetUserIds: { has: userId },
    targetAdminOnly: false, // Exclude admin-only notifications unless user is admin
  });

  // 4. Notifications targeted to user's institution (if they have one)
  if (institution) {
    orConditions.push({
      targetInstitutions: { has: institution },
      targetAdminOnly: false, // Exclude admin-only notifications unless user is admin
    });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      OR: orConditions,
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

  // Ensure receipts exist - check which ones are missing first
  const notificationIds = notifications.map((n) => n.id);
  const existingReceipts = await prisma.notificationReceipt.findMany({
    where: {
      userId,
      notificationId: { in: notificationIds },
    },
    select: { notificationId: true },
  });

  const existingNotificationIds = new Set(existingReceipts.map(r => r.notificationId));
  const missingReceipts = notifications
    .filter(n => !existingNotificationIds.has(n.id))
    .map((n) => ({ notificationId: n.id, userId }));

  if (missingReceipts.length > 0) {
    await prisma.notificationReceipt.createMany({
      data: missingReceipts,
    });
  }

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
