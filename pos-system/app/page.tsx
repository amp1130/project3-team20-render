import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to My App</CardTitle>
          <CardDescription>Built with Next.js, Shadcn UI, and Tailwind CSS</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a sample card component from Shadcn UI.</p>
        </CardContent>
        <CardFooter>
          <Button>Get Started</Button>
        </CardFooter>
      </Card>
    </main>
  );
}