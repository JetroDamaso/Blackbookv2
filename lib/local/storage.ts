/**
 * LocalStorage Manager for Offline Booking System
 * Handles all data persistence in the browser
 */

export interface LocalBooking {
  id: number;
  eventName: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  status: number; // 1-7
  balance: number;
  originalPrice: number;
  pavilionId: number | null;
  clientId: number;
  lastStatusUpdate?: string; // ISO string
  createdAt: string; // ISO string
}

export interface LocalNotification {
  id: string;
  bookingId: number;
  type: 'new_booking' | 'payment_1week' | 'payment_3days' | 'payment_1day' | 'unpaid_reminder';
  message: string;
  createdAt: string; // ISO string
  read: boolean;
  triggered: boolean;
  eventName: string;
}

export interface NotificationSchedule {
  bookingId: number;
  lastNotificationSent?: string; // ISO string
  notificationHistory: Array<{
    type: string;
    sentAt: string;
  }>;
}

const STORAGE_KEYS = {
  BOOKINGS: 'blackbook_bookings',
  NOTIFICATIONS: 'blackbook_notifications',
  NOTIFICATION_SCHEDULES: 'blackbook_notification_schedules',
  LAST_SYNC: 'blackbook_last_sync',
};

/**
 * Get all bookings from LocalStorage
 */
export function getLocalBookings(): LocalBooking[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing bookings:', error);
    return [];
  }
}

/**
 * Save bookings to LocalStorage
 */
export function saveLocalBookings(bookings: LocalBooking[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new Event('bookings-updated'));
}

/**
 * Update a single booking
 */
export function updateLocalBooking(bookingId: number, updates: Partial<LocalBooking>): void {
  const bookings = getLocalBookings();
  const index = bookings.findIndex(b => b.id === bookingId);

  if (index !== -1) {
    bookings[index] = {
      ...bookings[index],
      ...updates,
      lastStatusUpdate: new Date().toISOString(),
    };
    saveLocalBookings(bookings);
  }
}

/**
 * Add a new booking
 */
export function addLocalBooking(booking: LocalBooking): void {
  const bookings = getLocalBookings();
  bookings.push(booking);
  saveLocalBookings(bookings);
}

/**
 * Get all notifications
 */
export function getLocalNotifications(): LocalNotification[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing notifications:', error);
    return [];
  }
}

/**
 * Save notifications to LocalStorage
 */
export function saveLocalNotifications(notifications: LocalNotification[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new Event('notifications-updated'));
}

/**
 * Add a new notification
 */
export function addLocalNotification(notification: Omit<LocalNotification, 'id' | 'createdAt'>): LocalNotification {
  const notifications = getLocalNotifications();

  const newNotification: LocalNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotification); // Add to beginning
  saveLocalNotifications(notifications);

  return newNotification;
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const notifications = getLocalNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);

  if (index !== -1) {
    notifications[index].read = true;
    saveLocalNotifications(notifications);
  }
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const notifications = getLocalNotifications();
  notifications.forEach(n => n.read = true);
  saveLocalNotifications(notifications);
}

/**
 * Delete a notification
 */
export function deleteLocalNotification(notificationId: string): void {
  const notifications = getLocalNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveLocalNotifications(filtered);
}

/**
 * Get notification schedules
 */
export function getNotificationSchedules(): NotificationSchedule[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SCHEDULES);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing notification schedules:', error);
    return [];
  }
}

/**
 * Save notification schedules
 */
export function saveNotificationSchedules(schedules: NotificationSchedule[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SCHEDULES, JSON.stringify(schedules));
}

/**
 * Update notification schedule for a booking
 */
export function updateNotificationSchedule(
  bookingId: number,
  type: string,
  sentAt: string = new Date().toISOString()
): void {
  const schedules = getNotificationSchedules();
  const index = schedules.findIndex(s => s.bookingId === bookingId);

  if (index !== -1) {
    schedules[index].lastNotificationSent = sentAt;
    schedules[index].notificationHistory.push({ type, sentAt });
  } else {
    schedules.push({
      bookingId,
      lastNotificationSent: sentAt,
      notificationHistory: [{ type, sentAt }],
    });
  }

  saveNotificationSchedules(schedules);
}

/**
 * Clear all local data (for testing/reset)
 */
export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Get unread notification count
 */
export function getUnreadNotificationCount(): number {
  const notifications = getLocalNotifications();
  return notifications.filter(n => !n.read).length;
}

/**
 * Sync bookings from database to LocalStorage
 * Call this when online to populate initial data
 */
export function syncBookingsFromDatabase(bookings: any[]): void {
  const localBookings: LocalBooking[] = bookings.map(b => ({
    id: b.id,
    eventName: b.eventName,
    startAt: new Date(b.startAt).toISOString(),
    endAt: new Date(b.endAt).toISOString(),
    status: b.status,
    balance: b.billing?.balance || 0,
    originalPrice: b.billing?.originalPrice || 0,
    pavilionId: b.pavilionId,
    clientId: b.clientId,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
  }));

  saveLocalBookings(localBookings);
}
