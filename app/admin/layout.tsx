import { ReactNode } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}