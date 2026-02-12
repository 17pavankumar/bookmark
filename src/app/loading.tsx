
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f0c29]">
      <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
    </div>
  );
}
