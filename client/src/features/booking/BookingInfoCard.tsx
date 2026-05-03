import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';

interface BookingInfoCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export const BookingInfoCard = ({ title, icon, action, children }: BookingInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          {icon}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
