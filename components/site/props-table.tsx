import type { Meta } from "@/lib/schema"

export function PropsTable({ props }: { props: Meta["props"] }) {
  if (props.length === 0) return null
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Prop</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Default</th>
            <th className="px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b last:border-0">
              <td className="px-4 py-3 font-mono text-[13px]">{prop.name}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{prop.type}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{prop.default}</td>
              <td className="px-4 py-3 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
