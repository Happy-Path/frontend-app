// src/components/admin/AdminTabsSystem.tsx
import AdminNotifications from "@/components/admin/AdminNotifications";

const AdminTabsSystem = () => {
    return (
        <div className="space-y-6">
            <AdminNotifications />

            {/*
        If you have other system settings later, you can add them below,
        e.g. feature toggles, maintenance mode, etc.
      */}
        </div>
    );
};

export default AdminTabsSystem;
