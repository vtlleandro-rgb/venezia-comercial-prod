export type NotificationPayload = {
  title: string;
  content: string;
};

// Serviço de notificação não utilizado neste projeto.
// Mantido como no-op para compatibilidade com systemRouter.
export async function notifyOwner(
  _payload: NotificationPayload
): Promise<boolean> {
  return false;
}
