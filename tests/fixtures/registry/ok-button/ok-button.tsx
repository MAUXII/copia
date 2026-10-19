import { cn } from "@/lib/utils"

export function OkButton({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("rounded-md px-4 py-2", className)} {...props} />
}
