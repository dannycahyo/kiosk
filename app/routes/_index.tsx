import type { Route } from "./+types/_index";
import { BoothContainer } from "~/components/booth/BoothContainer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Snap & Go Photobooth" },
    { name: "description", content: "Your instant photobooth experience" },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, user-scalable=no",
    },
  ];
}

export default function Index() {
  return (
    <div className="w-full min-h-screen">
      <BoothContainer />
    </div>
  );
}
