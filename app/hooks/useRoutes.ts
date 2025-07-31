import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
    HiArrowLeftOnRectangle,
    HiUsers
} from "react-icons/hi2";
import { GiMoneyStack } from "react-icons/gi";
import { RiAdminFill } from "react-icons/ri";
import { GrHistory } from "react-icons/gr";
import { MdManageAccounts } from "react-icons/md";
import { signOut } from "next-auth/react";

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    // nextauth.message
    signOut({
      callbackUrl: '/' // Redirect to home page after logout
    })
  }

const useRoutes = () => {
    const pathname = usePathname();

    let userRole;
    if (typeof window !== "undefined") {
        userRole = localStorage?.getItem('role');
    }

    const isAdmin = userRole === 'ROLE_ADMIN';
    const isCustomer = userRole === 'ROLE_CUSTOMER';
    const isLoanOfficer = userRole === 'ROLE_LOAN_OFFICER';
    const isManager = userRole === 'ROLE_MANAGER';

    let routes:any = [];

    if (isCustomer) {
        routes = useMemo(() => [
            {
                label: "Users",
                href: "/users",
                icon: HiUsers,
                active: pathname === "/users"
            },
            {
                label: "Transfer Money",
                href: "/users/transfer",
                icon: GiMoneyStack,
                active: pathname === "/users/transfer"
            },
            {
                label: "Transaction History",
                href: "/users/history",
                icon: GrHistory,
                active: pathname === "/users/history"
            },
            {
                label: "Sign Out",
                href: "#",
                onClick: () => handleLogout(),
                icon: HiArrowLeftOnRectangle,
            }
        ],[pathname])
    }

    if (isAdmin) {
        routes = useMemo(() => [
            {
                label: "Manage Users",
                href: "/admin",
                icon: RiAdminFill,
                active: pathname === "/admin"
            },
            {
                label: "Sign Out",
                href: "#",
                onClick: () => handleLogout(),
                icon: HiArrowLeftOnRectangle,
            }
        ],[pathname])
    }

    if (isManager) {
        routes = useMemo(() => [
            {
                label: "Manage Accounts",
                href: "/manager",
                icon: MdManageAccounts,
                active: pathname === "/manager"
            },
            {
                label: "Sign Out",
                href: "#",
                onClick: () => handleLogout(),
                icon: HiArrowLeftOnRectangle,
            }
        ],[pathname])
    }

    return routes;
}

export default useRoutes;