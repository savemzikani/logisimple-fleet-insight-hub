import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Clock, Truck, Wrench } from 'lucide-react';

type ActivityType = 'warning' | 'success' | 'info' | 'danger';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
}
const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'danger':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'info':
    default:
      return <Clock className="h-4 w-4 text-blue-500" />;
  }
};

export function ActivityFeed({ activities, isLoading = false, maxItems = 5 }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4 py-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No recent activity</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your recent activities will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.slice(0, maxItems).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="mt-0.5">
              {activity.icon || getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{activity.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
