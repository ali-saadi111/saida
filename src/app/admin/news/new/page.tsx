import EditNews from "../[id]/page";

export const dynamic = "force-dynamic";

export default function NewNews() {
  return <EditNews params={Promise.resolve({ id: "new" })} />;
}
