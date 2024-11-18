"use client";

import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/photos",
    label: "Collections",
  },
];
const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className=" items-center gap-x-4 overflow-x-auto hidden md:flex">
      {routes.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            pathname.startsWith(href) && "text-sky-500",
            "hover:text-sky-500 transition-all duration-150"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
