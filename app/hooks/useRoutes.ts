import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiChat } from "react-icons/hi";
import {
    HiArrowLeftOnRectangle,
    HiUsers
} from "react-icons/hi2";
import { signOut } from "next-auth/react";

const handleLogout = () => {
    signOut({
      callbackUrl: '/' // Redirect to home page after logout
    })
  }

const useRoutes = () => {
    const pathname = usePathname();

    const routes = useMemo(() => [
        {
            label: "Users",
            href: "/users",
            icon: HiUsers,
            active: pathname === "/users"
        },
        {
            label: "Sign Out",
            href: "#",
            onClick: () => handleLogout(),
            icon: HiArrowLeftOnRectangle,
        }
    ],[pathname])

    return routes;
}

export default useRoutes;