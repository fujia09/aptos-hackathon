import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, DollarSign, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ModelCardProps {
  name: string
  description: string
  requests: number
  revenue: number
  status: "active" | "inactive" | "pending"
}

export function ModelCard({ name, description, requests, revenue, status }: ModelCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit model</DropdownMenuItem>
              <DropdownMenuItem>View API keys</DropdownMenuItem>
              <DropdownMenuItem>Adjust pricing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Deactivate model</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Requests
            </span>
            <span className="text-xl font-bold">{requests.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Revenue
            </span>
            <span className="text-xl font-bold">${revenue.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Manage Model
        </Button>
      </CardFooter>
    </Card>
  )
}

