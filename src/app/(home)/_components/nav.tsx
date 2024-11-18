"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx/lite";
import Link from "next/link";
import ViewSwitcher, { SwitcherSelection } from "./viewSwitcher";
import { isPathGrid } from "@/utils/validatePath";

export default function Nav({
  siteDomainOrTitle,
}: {
  siteDomainOrTitle: string;
}) {
  const renderLink = (text: string, linkOrAction: any) => (
    <Link href={linkOrAction} className="text-black">{text}</Link>
  );
  const pathname = usePathname();

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === '/') {
      return "feed";
    } else if (isPathGrid(pathname)) {
      return "grid";
    }
  };

  return (
    <div key="nav" className={clsx("flex items-center w-full min-h-[4rem]")}>
      <ViewSwitcher currentSelection={switcherSelectionForPath()} />
      <div
        className={clsx(
          "flex-grow text-right min-w-0",
          "hidden xs:block",
          "translate-y-[-1px]",
        )}
      >
        <div className={clsx("truncate overflow-hidden")}>
          {renderLink(siteDomainOrTitle, process.env.NEXT_PUBLIC_APP_URL)}
        </div>
      </div>
    </div>
  );
}
