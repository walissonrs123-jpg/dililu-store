import { ImageResponse } from "next/og";
export const alt = "Dililu — Moda bebê e infantil em Uberlândia/MG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#eee4f4", color: "#30283a" }}><div style={{ fontSize: 100, color: "#694180", marginBottom: 24 }}>Dililu</div><div style={{ fontSize: 44 }}>Moda bebê e infantil</div><div style={{ fontSize: 28, marginTop: 32 }}>Uberlândia/MG · @dililu.moda</div></div>, size);
}
