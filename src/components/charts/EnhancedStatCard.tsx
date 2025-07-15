import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart3, Users, MapPin, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DetailModal } from '@/components/modals/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  onClick?: () => void;
  drillDownData?: {
    items: Array<{
      id: string;
      name: string;
      value: string;
      status: string;
      details?: string;
    }>;
    metrics: {
      total: number;
      active: number;
      inactive: number;
      change: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
      };
    };
  };
}

export function EnhancedStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
  iconColor,
  isLoading = false,
  onClick,
  drillDownData
}: StatCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRight : 
                   trend?.direction === 'down' ? ArrowDownRight : null;

  const handleCardClick = () => {
    if (drillDownData) {
      setShowDetail(true);
    }
    onClick?.();
  };

  const renderDetailView = () => {
    if (!drillDownData) return null;

    return (
      <DetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={title}
        description={`Detailed breakdown of ${title.toLowerCase()}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Metrics Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold">{drillDownData.metrics.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{drillDownData.metrics.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">{drillDownData.metrics.inactive}</div>
              <div className="text-sm text-muted-foreground">Inactive</div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Trend Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendIcon className={cn(
                  "h-4 w-4",
                  drillDownData.metrics.change.direction === 'up' ? 'text-green-500' : 'text-amber-500'
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  drillDownData.metrics.change.direction === 'up' ? 'text-green-600' : 'text-amber-600'
                )}>
                  {drillDownData.metrics.change.value}
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              {title} Details
            </h4>
            {drillDownData.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.details || 'No additional details'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={cn(
                    item.status === 'active' ? 'border-green-500 text-green-600' :
                    item.status === 'maintenance' ? 'border-amber-500 text-amber-600' :
                    'border-red-500 text-red-600'
                  )}>
                    {item.status}
                  </Badge>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </div>
      </DetailModal>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "h-full",
          drillDownData && "cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        <div className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 h-full p-6",
          drillDownData && "hover:shadow-md hover:scale-[1.02]"
        )}>
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
            {drillDownData && (
              <div className="mt-2 text-xs text-muted-foreground">
                Click to view details
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {renderDetailView()}
    </>
  );
}