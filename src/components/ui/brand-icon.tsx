import { withBasePath } from "@/utils/paths";
import { cn } from "@/utils/style";

type Props = React.ComponentProps<"img"> & {
	variant?: "logo" | "icon";
};

export function BrandIcon({ variant = "logo", className, ...props }: Props) {
	return (
		<>
			<img
				src={withBasePath(`/${variant}/dark.png`)}
				alt="Juvakel"
				className={cn("hidden size-12 dark:block", className)}
				{...props}
			/>
			<img
				src={withBasePath(`/${variant}/light.png`)}
				alt="Juvakel"
				className={cn("block size-12 dark:hidden", className)}
				{...props}
			/>
		</>
	);
}
