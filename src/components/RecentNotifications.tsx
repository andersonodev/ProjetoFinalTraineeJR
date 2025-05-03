
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  date: string;
  user: string;
  isNew?: boolean;
}

interface RecentNotificationsProps {
  notifications: readonly Notification[] | Notification[]; // Updated to accept both readonly and mutable arrays
}

const RecentNotifications = ({ notifications }: RecentNotificationsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Notificações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <li key={notification.id} className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {notification.user} • {notification.date}
                  </p>
                </div>
                {notification.isNew && (
                  <Badge variant="outline" className="ml-auto bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
                    Nova
                  </Badge>
                )}
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-muted-foreground">
              Nenhuma notificação recente
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentNotifications;
