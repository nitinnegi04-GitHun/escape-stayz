
import React from 'react';
import { AdminLayout } from '../../../components/Admin/AdminLayout';

export default function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
