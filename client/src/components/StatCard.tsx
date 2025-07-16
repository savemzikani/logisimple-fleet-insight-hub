import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    change: string;
  };
  color: string;
  iconColor: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
  iconColor,
  isLoading = false
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : 
                   trend?.direction === 'down' ? ArrowDownRight : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-2xl font-bold">
            {isLoading ? <div className="h-8 w-16 bg-muted rounded animate-pulse" /> : value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {trend && (
            <div className="mt-2 flex items-center text-xs">
              {TrendIcon && (
                <TrendIcon 
                  className={cn(
                    "h-3.5 w-3.5 mr-1",
                    trend.direction === 'up' ? 'text-green-500' : 'text-amber-500'
                  )} 
                />
              )}
              <span className={cn(
                "font-medium",
                trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 
                trend.direction === 'down' ? 'text-amber-600 dark:text-amber-400' :
                'text-muted-foreground'
              )}>
                {trend.value} {trend.change}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
