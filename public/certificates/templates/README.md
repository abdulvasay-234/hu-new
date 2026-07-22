# Certificate Templates

Drop your real certificate background images in this folder.

Recommended export:
- PNG
- 1280x900 (or match template.width / template.height)
- Keep safe margins so dynamic text does not overlap decorative edges

Then update the matching event template in:
- public/certificates/events/index.json

Example:
{
  "template": {
    "width": 1280,
    "height": 900,
    "backgroundImage": "./templates/obw-2026-template.png",
    "backgroundOverlayOpacity": 0.08,
    "headline": "Certificate of Participation",
    "subtitle": "This is proudly presented to",
    "signatureName": "HackUnion Organizing Team",
    "layout": {
      "headlineY": 240,
      "subtitleY": 304,
      "nameY": 402,
      "eventY": 462,
      "typeY": 506,
      "metaLeftX": 118,
      "metaRightX": 1162,
      "metaY1": 712,
      "metaY2": 752,
      "sealX": 168,
      "sealY": 645,
      "signatureLineStartX": 860,
      "signatureLineEndX": 1162,
      "signatureLineY": 696,
      "signatureY": 686
    },
    "textStyles": {
      "primary": "#111827",
      "secondary": "#60708a",
      "meta": "#334155",
      "headlineFont": "700 64px Inter, Segoe UI, sans-serif",
      "subtitleFont": "500 28px Inter, Segoe UI, sans-serif",
      "nameFont": "700 68px Inter, Segoe UI, sans-serif",
      "eventFont": "500 30px Inter, Segoe UI, sans-serif",
      "typeFont": "500 22px Inter, Segoe UI, sans-serif",
      "metaFont": "600 22px Inter, Segoe UI, sans-serif",
      "signatureFont": "700 24px Inter, Segoe UI, sans-serif"
    }
  }
}
