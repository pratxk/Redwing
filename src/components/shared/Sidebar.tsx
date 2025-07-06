"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Menu, 
  X, 
  Home, 
  Drone, 
  Target, 
  MapPin, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuthContext } from '@/features/auth/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '@/constants/roles';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: MenuItem[];
  requiredRole?: keyof typeof ROLES;
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[keyof typeof ROLE_PERMISSIONS];
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Missions',
      href: '/missions',
      icon: Target,
      requiredPermission: 'canManageMissions',
    },
    {
      title: 'Drones',
      href: '/drones',
      icon: Drone,
      requiredPermission: 'canManageDrones',
    },
    {
      title: 'Sites',
      href: '/sites',
      icon: MapPin,
      requiredPermission: 'canManageSites',
    },
    {
      title: 'Users',
      href: '/users',
      icon: Users,
      requiredPermission: 'canManageUsers',
    },
    // {
    //   title: 'Organizations',
    //   href: '/organizations',
    //   icon: Building2,
    //   requiredPermission: 'canManageOrganizations',
    // },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      requiredPermission: 'canViewAnalytics',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const hasPermission = (item: MenuItem) => {
    if (!user) return false;
    
    if (item.requiredRole && user.role !== item.requiredRole) {
      return false;
    }
    
    if (item.requiredPermission) {
      const permissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
      return permissions[item.requiredPermission];
    }
    
    return true;
  };

  const filteredMenuItems = menuItems.filter(hasPermission);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        <Link href={hasChildren ? '#' : item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-10 px-3",
              isActive && "bg-secondary"
            )}
            onClick={hasChildren ? () => toggleExpanded(item.title) : undefined}
          >
            <item.icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )
            )}
          </Button>
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link key={child.href} href={child.href}>
                <Button
                  variant={pathname === child.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-8 px-3 text-sm",
                    pathname === child.href && "bg-secondary"
                  )}
                >
                  <child.icon className="h-3 w-3 mr-2" />
                  {child.title}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-lg font-semibold">Redwing</h1>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredMenuItems.map(renderMenuItem)}
            </nav>
          </ScrollArea>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.firstName} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 