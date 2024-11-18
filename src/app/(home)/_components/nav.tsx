"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx/lite";
import Link from "next/link";
import ViewSwitcher, { SwitcherSelection } from "./viewSwitcher";
import { isPathFeed, isPathGrid } from "@/utils/validatePath";

export default function Nav({
  siteDomainOrTitle,
}: {
  siteDomainOrTitle: string;
}) {
  const renderLink = (text: string, linkOrAction: any) => (
    <Link href={linkOrAction} className="text-black">{text}</Link>
  );
  const publicURL = process.env.NEXT_PUBLIC_APP_URL;
  const pathname = usePathname();

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === publicURL) {
      return "feed";
    } else if (isPathGrid(pathname)) {
      return "grid";
    } else if (isPathFeed(pathname)) {
      return "feed";
    }
  };

  return (
    <div className={clsx("flex items-center w-full min-h-[4rem]")}>
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
