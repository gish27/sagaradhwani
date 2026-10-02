import Link from "next/link";
import { DocPage } from "@/components/doc";
export const metadata = { title: "Editorial, footage & advertising policy · Sagara Dhwani" };
export default function Page() {
  return (
    <DocPage file="07-editorial-footage-policy.md">
      <p className="text-xs text-stone-500 mb-6">Also: <Link className="underline" href="/policy/advertising">Advertising policy</Link> · <Link className="underline" href="/ops/policy">How the newsroom software enforces these rules</Link></p>
    </DocPage>
  );
}
