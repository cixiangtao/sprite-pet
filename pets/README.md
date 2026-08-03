# Built-in pets

This directory is the source of truth for the pets shown on the sprite-pet website. Each pet keeps
the portable two-file layout:

```text
guga/
├── pet.json
└── spritesheet.webp
```

The website packages those two files together with `NOTICE.md` as an on-demand ZIP. The generated
archives live only in the website build and are not committed.

These assets are excluded from the npm package and are not covered by the renderer's MIT License.
Read [NOTICE.md](./NOTICE.md) and [THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md) before reuse.
