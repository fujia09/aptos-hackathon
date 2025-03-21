import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Coins, DollarSign, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TokenStatsProps {
  name: string
  fullName: string
  price: number
  change: number
  volume: number
  liquidity: number
}

export function TokenStats({ name, fullName, price, change, volume, liquidity }: TokenStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>{name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View token details</DropdownMenuItem>
              <DropdownMenuItem>Adjust parameters</DropdownMenuItem>
              <DropdownMenuItem>Add liquidity</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export statistics</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{fullName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Price
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">${price.toFixed(4)}</span>
              <span className={`text-xs flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">24h Volume</span>
            <span className="text-xl font-bold">${volume.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">Liquidity</span>
          <span className="block text-xl font-bold">${liquidity.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          Buy
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Sell
        </Button>
      </CardFooter>
    </Card>
  )
}

