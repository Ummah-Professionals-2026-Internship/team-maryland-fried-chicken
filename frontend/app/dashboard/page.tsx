import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
      <p className="mt-2 text-zinc-600">Placeholder dashboard page.</p>
      <Card size="sm" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Example Card component with Button component </CardTitle>
        <CardDescription>
          This card uses the small size variant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          The card component supports a size prop that can be set to
          &quot;sm&quot; for a more compact appearance.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Button
        </Button>
      </CardFooter>
    </Card>

    <Card size="sm" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Example Card component with Button component </CardTitle>
        <CardDescription>
          This card uses the small size variant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          The card component supports a size prop that can be set to
          &quot;sm&quot; for a more compact appearance.
        </p>
      </CardContent>
    </Card>
      </div>
    </MainLayout>
  );
}
