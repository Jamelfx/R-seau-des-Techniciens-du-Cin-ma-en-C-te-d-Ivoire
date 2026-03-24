import Image from "next/image"

type TalentStatus = "disponible" | "en-tournage" | "indisponible"

interface TalentCardProps {
  name: string
  role: string
  image: string
  status: TalentStatus
}

const statusConfig: Record<TalentStatus, { label: string; className: string }> = {
  "disponible": {
    label: "Disponible",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  "en-tournage": {
    label: "En Tournage",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  "indisponible": {
    label: "Indisponible",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

export function TalentCard({ name, role, image, status }: TalentCardProps) {
  const { label, className } = statusConfig[status]

  return (
    <div className="group flex items-center gap-4 rounded-xl bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
      <div className="ml-auto">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {label}
        </span>
      </div>
    </div>
  )
}
