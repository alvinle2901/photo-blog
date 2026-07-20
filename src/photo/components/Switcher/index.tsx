import { Children, Fragment, isValidElement, type ReactNode } from "react";

import { cn } from "@/utils/cn";

const Switcher = ({
	children,
	type = "regular",
}: {
	children: ReactNode;
	type?: "regular" | "borderless";
}) => {
	const items = Children.toArray(children);

	return (
		<div
			className={cn(
				"flex overflow-hidden",
				"border rounded-md",
				type === "regular"
					? "border-gray-300 dark:border-gray-800"
					: "border-transparent",
				type === "regular" && "shadow-sm",
			)}
		>
			{items.map((child, index) => {
				const key = isValidElement(child) ? child.key : String(child);

				return (
					<Fragment key={key}>
						{index > 0 && (
							<span
								aria-hidden="true"
								className="w-px shrink-0 self-stretch bg-gray-300 dark:bg-gray-800"
							/>
						)}
						{child}
					</Fragment>
				);
			})}
		</div>
	);
};

export default Switcher;
