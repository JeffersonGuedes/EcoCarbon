import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Cálculo concluído para "inventario_2024.csv"',
    message: 'O arquivo foi processado com sucesso. Resultado: 145.2 tCO2e',
    timestamp: '15/03/2024, 09:15',
    isRead: false
  },
  {
    id: '2',
    type: 'error',
    title: 'Falha no processamento de "inventario_2023.csv"',
    message: 'Erro na validação dos dados. Verifique o formato do arquivo.',
    timestamp: '20/12/2023, 14:30',
    isRead: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Upload realizado com sucesso',
    message: 'O arquivo "dados_energia.xlsx" foi enviado e está sendo processado.',
    timestamp: '10/03/2024, 11:20',
    isRead: true
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Bell className="h-5 w-5 text-info" />;
    }
  };

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-success';
      case 'error':
        return 'border-l-4 border-l-destructive';
      default:
        return 'border-l-4 border-l-info';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notificação removida');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Todas as notificações foram removidas');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-foreground">Notificações</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Limpar Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${getNotificationBorder(notification.type)} ${
                    !notification.isRead ? 'bg-accent/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <div className="flex gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-primary hover:text-primary/80"
                              >
                                Marcar como lida
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}