import ThemeSwitch from "#src/components/custom/theme-switch";
import { buttonVariants } from "#src/components/ui/button";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "#src/utils/misc";

type HeaderProps = {
	children?: React.ReactNode;
	menu?: React.ReactNode;
	redirectTo: string;
	title?: string;
	isIndex?: boolean;
};

export function Header(props: HeaderProps) {
	document.title = props.title
		? props.title === "kiat"
			? "Kiat"
			: props.title
		: "Kiat";
	return (
		<header className="px-1.5 pt-2.5 pb-2 flex justify-between gap-x-3 border-b sticky top-0 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 z-10">
			<div className="flex items-center gap-x-2">
				<Link
					title="Kembali"
					{...(!props.isIndex
						? {
								className: cn(
									buttonVariants({ size: "icon", variant: "ghost" }),
									"[&_svg]:size-6",
								),
							}
						: {})}
					to={props.redirectTo}
				>
					{!props.isIndex ? (
						<ChevronLeft />
					) : (
						<span className="pl-2 text-lg font-semibold">{props.title}</span>
					)}
				</Link>

				{!props.isIndex && !props.menu && (
					<span className="text-lg font-semibold">{props.title}</span>
				)}
				{props.menu && props.menu}
			</div>

			<div className="flex items-center gap-1">
				{props.children && props.children}
				<ThemeSwitch />
			</div>
		</header>
	);
}
