import { Package, ShoppingCart, TrendingUp } from 'lucide-react';

type UserRole = 'warehouse' | 'sales' | 'executive';

interface RoleBadgeProps {
  userRole: UserRole;
}

export function RoleBadge({ userRole }: RoleBadgeProps) {
  const getRoleInfo = () => {
    switch (userRole) {
      case 'warehouse':
        return {
          icon: Package,
          title: 'Almacenista',
          color: 'from-[#1B4332] to-[#2D6A4F]',
          textColor: 'text-[#1B4332]',
          bgColor: 'bg-[#1B4332]/10',
        };
      case 'sales':
        return {
          icon: ShoppingCart,
          title: 'Vendedor',
          color: 'from-[#0071E3] to-[#005BB5]',
          textColor: 'text-[#0071E3]',
          bgColor: 'bg-[#0071E3]/10',
        };
      case 'executive':
        return {
          icon: TrendingUp,
          title: 'Ejecutivo',
          color: 'from-[#10B981] to-[#059669]',
          textColor: 'text-[#10B981]',
          bgColor: 'bg-[#10B981]/10',
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${roleInfo.bgColor} backdrop-blur-sm`}
    >
      <Icon size={16} className={roleInfo.textColor} />
      <span style={{ fontSize: '13px', fontWeight: '600' }} className={roleInfo.textColor}>
        {roleInfo.title}
      </span>
    </div>
  );
}
