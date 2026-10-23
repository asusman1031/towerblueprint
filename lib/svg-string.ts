import { isValidElement, type ReactElement, type ReactNode } from "react";

// Turns the element tree of a plain (hook-free) SVG component into markup text.
// Next.js does not let a route handler import react-dom/server, and the drawings
// are pure functions, so a tiny serializer is all that is needed.

const KEEP = new Set(["viewBox", "preserveAspectRatio"]);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function attrs(props: Record<string, unknown>) {
  let out = "";
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || v === undefined || v === null || v === false) continue;
    if (k === "style" && typeof v === "object") {
      const css = Object.entries(v as Record<string, string | number>)
        .map(([p, val]) => `${kebab(p)}:${val}`)
        .join(";");
      out += ` style="${esc(css)}"`;
      continue;
    }
    const name = k === "className" ? "class" : KEEP.has(k) ? k : kebab(k);
    out += ` ${name}="${esc(String(v))}"`;
  }
  return out;
}

export function svgToString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return esc(String(node));
  if (Array.isArray(node)) return node.map(svgToString).join("");
  if (!isValidElement(node)) return "";
  const el = node as ReactElement<Record<string, unknown>>;
  if (typeof el.type === "function") {
    return svgToString((el.type as (p: unknown) => ReactNode)(el.props));
  }
  if (typeof el.type !== "string") return svgToString(el.props.children as ReactNode);
  const inner = svgToString(el.props.children as ReactNode);
  return inner ? `<${el.type}${attrs(el.props)}>${inner}</${el.type}>` : `<${el.type}${attrs(el.props)}/>`;
}
