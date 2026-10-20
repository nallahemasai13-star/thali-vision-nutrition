import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Live camera preview. Captures a JPEG and hands it back as a File; nothing is uploaded or stored here. */
export function CameraCapture({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState<{ url: string; file: File } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) { setError("This browser doesn't support camera access. Upload a photo instead."); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        stream.current = s;
        if (video.current) { video.current.srcObject = s; void video.current.play().then(() => setReady(true)).catch(() => setReady(true)); }
      })
      .catch((e: { name?: string }) => {
        setError(e?.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, or upload a photo instead."
          : e?.name === "NotFoundError" ? "No camera was found on this device. Upload a photo instead."
          : "The camera couldn't be started. Upload a photo instead.");
      });
    return () => { cancelled = true; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  const capture = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    c.toBlob((b) => {
      if (!b) { setError("Couldn't capture the photo. Try again."); return; }
      const file = new File([b], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      setShot({ url: URL.createObjectURL(b), file });
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="card-surface space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scan with camera</h3>
        <Button variant="ghost" size="icon" aria-label="Close camera" onClick={onClose}><X /></Button>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <video ref={video} playsInline muted className={shot ? "hidden" : "h-full w-full object-cover"} aria-label="Camera preview" />
          {shot && <img src={shot.url} alt="Captured food" className="h-full w-full object-contain" />}
          {!ready && !shot && <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Starting camera…</p>}
        </div>
      )}
      {!error && <div className="flex flex-wrap gap-2">
        {shot ? <>
          <Button onClick={() => { onCapture(shot.file); onClose(); }}><Camera /> Use this photo</Button>
          <Button variant="outline" onClick={() => setShot(null)}><RotateCcw /> Retake</Button>
        </> : <Button onClick={capture} disabled={!ready}><Camera /> Capture</Button>}
      </div>}
    </div>
  );
}
