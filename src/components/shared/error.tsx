import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export default function Error({ message }: { message?: string | null }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message || "An error occurred!"}</AlertDescription>
    </Alert>
  );
}
