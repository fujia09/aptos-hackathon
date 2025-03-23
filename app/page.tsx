import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className="text-center space-y-8 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">AITokenize</h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The platform for browsing and hosting AI models with tokenized access
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/browse">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto">
              <span>Browse Models</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/developer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 h-auto">
              <span>Host Models</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-sm text-muted-foreground">Secure, decentralized, and efficient AI model marketplace</p>
      </div>
    </div>
  )
}

