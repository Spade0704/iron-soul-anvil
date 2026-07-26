---
title: "IRON_SOUL_STYLE — Visual Style Bible v0.1 (Anvil game layer)"
branch: map-simbox
type: reference
visibility: internal
status: RATIFIED v0.1 (Operator, 2026-07-25, via Director relay) — canon; style_bible_ref: iron-soul-style-bible@v0.1
last_updated: 2026-07-26
owner: Battlemaster (Iron Soul PM)
canon_sources:
  - "wiki.project_iron_soul/git/planet-scoria-prime/scoria-look-bible.md (palette rules, material honesty, per-location briefs, consistency system)"
  - "wiki.project_iron_soul/git/planet-scoria-prime/founding-six.md (accent hex values)"
  - "wiki.project_iron_soul/git/iron-soul/arenas.md (phase-lock aesthetic ladder, spectator registers)"
  - "wiki.project_iron_soul/git/map-simbox/simbox-ux-pixel-art.md (shell aesthetic, ember accent, MapArt conventions)"
related_files:
  - "[[anvil-arena-autobattler-design]]"
  - "[[scoria-look-bible]]"
  - "[[arenas]]"
---

# IRON_SOUL_STYLE — Visual Style Bible v0.1

> **This is the REAL style bible** for the Anvil game layer (`games/iron-soul/`). It
> **SUPERSEDES the placeholder already committed in the fork**
> (`games/iron-soul/public/assets/style/IRON_SOUL_STYLE.md` @ e1ae368 — the
> Integration-Framework §5.1 "mythic indigo/gold" content), which does NOT match
> Iron Soul visual canon and must not be used for generation. Three clauses from
> that file are PRESERVED verbatim in §11 (canon-wins, reveal fence, pipeline lock).
>
> **Gate status:** §12 checklist **RATIFIED whole by the Operator 2026-07-25** (via
> Director relay) — this bible is canon and `style_bible_ref: iron-soul-style-bible@v0.1`
> is the binding anchor for the visual-evidence sidecar. Imagine generation remains
> gated on ONE remaining condition: the **visual-evidence standard (P0b) cert closing**.
> Greybox (G0–G3) is unaffected.
>
> **Page of record:** this wiki page. A verbatim copy ships to the fork at
> `games/iron-soul/public/assets/style/IRON_SOUL_STYLE.md` with the scaffold DRAFT PR;
> the wiki page wins on divergence. Every generated asset's evidence sidecar binds
> `style_bible_ref: iron-soul-style-bible@v0.1` (bump on any ratified change).

---

## 1 — Theme (one sentence)

**A scrap-forged frontier civilization that builds war-frames out of salvage and
belief** — forged-metal brutalism, dust and ember light, machines that feel heavy,
honest, and hand-riveted; the look graduates from torchlit blood-sport to broadcast
tactical spectacle as the world climbs P1→P5.

NOT: fantasy glow, sleek sci-fi chrome, "mythic circuit patterns," cool-blue holo
worlds. The future arrives late (P4–P5) and stays *earned* — institutional, then
high-tech tactical, never magical.

## 2 — Palette (locked, from the Scoria look bible)

- **World base: orange-brown-grey.** Rust, ochre, ash, oxidized steel, poured concrete.
- **Single warm light source, always (2700–3500K).** Forge glow, torch, brazier,
  dusk sun. No cool daylight, no moonlight. Volcanic/geothermal glow reads as the
  same warm source.
- **One cool counter only: tech-glow** — reserved for screens, holo boards, broadcast
  UI. It appears on-world only where the fiction earns it (P3+ announcer box,
  P4 command decks, P5 Crucible rig).
- **Ember accent `#C0532B`** — the product's signature accent (inherited from the
  Simbox shell). Primary UI accent color.
- **Saturation relief = accent colors only**, applied sparingly:
  - Team/guild accents on unit trim (player team vs. enemy team readability).
  - Reserved canon accents (do NOT reuse for generic UI): deep blue `#1E4B8F`,
    silver `#C0C0C0`, burnt orange `#CC6B2A`, crimson `#8B1A1A`, emerald `#2D6B4F`
    — these are Founder-associated in wider canon; the game layer treats them as
    RESERVED until the (reveal-gated) pilot layer exists.
- **Glow discipline:** glows are exceptional. **Volt carries the ONE canonical
  rail-emitter glow** (warm-white/amber, HITL look-lock). No other chassis glows in
  v0.1. No eye-glow, no power-aura.

## 3 — Material honesty (the "expensive look" at sprite scale)

Wear, oxidation, rust streaks, scorch, grime. Surface storytelling: polished where
hands/actuators grip, scratches at contact points. Micro-detail: rivets, weld seams,
cable runs, panel gaps, stencilled unit IDs. Structures: forged-metal frontier
brutalism — salvaged steel + poured concrete, one repeated structural rhythm so
everything reads as **one culture**. Form functional first, beautiful because honest.

## 4 — Camera, lighting, and sprite spec (Anvil/autobattler frame)

- **Camera:** high three-quarter top-down, fixed angle across ALL units and boards
  (the board is read at a glance; perspective consistency is non-negotiable).
- **Key light: upper-left, warm**, gentle rim/backlight to separate silhouette from
  board (the single biggest "looks like film" cue — kept even at sprite scale).
- **Silhouette first.** Every chassis must be identifiable at 64 px by outline alone.
  Class silhouette language: S slender/sensor-masted · L lean/angular · M boxy-square
  · H wide/low-slung · E spined with the rail emitter · T monumental/asymmetric.
- **Weight.** Idle = hydraulic settle, not breathing-bob. Walk = deliberate, ground
  impact implied. Heavy classes move like tonnage.
- **Deliverable format:** full body visible, solid flat background for keying,
  no text, no UI elements baked in, game-ready PNG. One base image per identity;
  `image_edit` for anim variants (idle / walk / attack / hit / death). Greybox until real.

## 5 — The aesthetic ladder (boards follow the phase lock)

Structural aesthetic per canon: **scaffolded scrap → institutional → high-tech
tactical complex.** Board dressing per stage:

| Board | Phase | Register |
|---|---|---|
| Sand Pit | P1 | rock-and-timber border, sand, torch/forge light, dust; spectators stand/perch; NO announcer, no tech |
| Walled Ring | P2 | Colosseum-grade tiered amphitheatre, arched entries, stone-and-scrap, ~200–400 crowd; peak ancient-duel era |
| The Pit | P3 | engineered arena, 5 m walls, elevated modern stands, announcer box, FIRST broadcast feed + first tech-glow |
| The Pit (mature) | P4 | per-team command decks, broadcast galleries — warfare register, not gladiator |
| Crucible Arena | P5 | high-tech tactical complex: terrain, grandstands, multi-angle broadcast rig, objective screens |

Atmosphere always: ash drift, embers, heat shimmer, haze for depth layering.
Inhabited: purposeful crowd, guild banners, stalls, tools mid-use.

## 6 — Chassis visual identities (7 base identities)

Gen ladder: **Gen 1 = crude scrap** (visible welds, mismatched plates, scaffold
framing) → **Gen 2 = refined institutional** (uniform plating, stencilled markings)
→ **Gen 3 = advanced tactical** (integrated systems, machined surfaces — still worn,
never chrome).

| Chassis | Class·Gen | Silhouette + read |
|---|---|---|
| Ghost | S·1 | slender scout, sensor mast, spindly legs — fragile, fast |
| Wraith | L·1 | lean angular skirmisher — forward-canted stance. NO glow |
| Scrap | M·1 | boxy brawler, mismatched salvage plates, exposed hydraulics |
| Refined | M·2 | Scrap's silhouette family, uniform plating — visibly "the upgrade" |
| Scab | H·2 | wide low-slung heavy, layered armor skirts, turreted mid-range gun. NO glow |
| Volt | E·2/3 | spined directed-energy frame, **the ONE canonical rail-emitter glow** (warm amber) |
| Titan | T·3 | monumental siege apex, artillery superstructure — reads double-height |

Star-up (1★→3★) = trim/decal edits on the SAME base identity (2★ trim, 3★ heavy
trim + banner pennant) — never a new base image (anti-drift).

## 7 — UI style

Industrial glassmorphism on the dark warm-dusk palette (shell convention): smoked
panels, ember `#C0532B` accents, stencil-industrial type for numbers/IDs, warm
parchment-grey text. Cost-band gems use metal grades (scrap/iron/steel/alloy/
crucible-glass), not rainbow rarity colors. Doctrine-family icons: 7 glyphs, punched-
metal stencil style. Tech-glow (cool) appears in UI only for broadcast/spectator
chrome at P3+ boards.

## 8 — Reveal fence (binding on all in-game text + public surfaces)

The game ships pre-reveal. All player-facing text uses pre-reveal vocabulary
(shell lesson 12 applies — route strings through a term table):

- "war-frame" (never MAP on a public surface — "MAP Simbox" product title exempt)
- "Recruit / Champion / guild" framing; no AI-explicit terms (agent, pilot-as-AI,
  slot economy, synapse)
- No named Scoria characters, no Founder accent-color association, no Pebble.
- Marketing/store copy passes the reveal-warden before publish.

This bible itself is `visibility: internal` — its language is dev-facing.

## 9 — Grok Imagine prompt templates (use verbatim, fill brackets)

**Unit sprite (base identity):**
```
High three-quarter top-down game sprite, [CHASSIS — e.g. "Scrap: crude Gen-1 medium
war-frame, boxy brawler, mismatched salvaged steel plates, exposed hydraulics,
visible weld seams, stencilled unit ID"], scrap-forged frontier style, orange-brown-
grey palette, warm single-source key light upper-left (2700–3500K) with subtle rim
light, worn oxidized metal with rust streaks and scorch marks, heavy grounded
stance, full body visible, solid flat background for easy keying, game-ready PNG,
no text, no UI elements, no glow
```
(Volt only: replace "no glow" with "single warm amber rail-emitter glow along the
dorsal rail, no other light sources".)

**Board plate:**
```
High three-quarter top-down arena board plate, [BOARD — e.g. "P1 Sand Pit: ~30 m
frontier fighting pit, rock-and-timber border, raked sand floor, torch and forge
light, standing spectators in dusty work clothes"], scrap-forged frontier
brutalism, one repeated structural rhythm, orange-brown-grey palette, single warm
light source, ash drift and heat-shimmer atmosphere, haze depth layering, inhabited
detail (guild banners, tools, stalls), empty central play area with clear flat
footing for unit placement, no text, no UI
```

**UI/icon:**
```
Game UI [ELEMENT — e.g. "doctrine-family icon: Tactical"], punched-metal stencil
style, industrial glassmorphism panel language, dark warm-dusk background, ember
orange #C0532B accent, worn steel texture, flat readable glyph at 48px, no text
```

## 10 — Anti-drift + registry rules (process, binding)

1. **Base once, edit every frame.** One base image per identity; variants via edit.
2. **Perspective sets before video** (if the game ever needs promo video, look-bible
   camera-language rules apply — start-frame library first).
3. Every asset registers in the Library with `ab-<type>-<identity>-<variant>` +
   `style_bible_ref` version.
4. **Look-lock escalation:** any new glow, any new accent color, any Founder-reserved
   hex, any named-character visual → Operator gate, not a local call.
5. Greybox until real: missing assets render as class-colored quads (S cyan · L green
   · M grey · H amber · E violet · T red — DEV colors, never shipped art direction).

## 11 — Preserved clauses (carried from the fork placeholder @ e1ae368)

**Canon-wins (subject-level):** if any MAP/Scoria-canon subject is rendered, its
ratified visual canon (Character Domain v1.0, VDF, Pebble Design Ratification
Addendum v1.0) WINS over this file.

**Reveal fence (file-level):** this file is dev/platform-branch (Iron Soul + MAP
Simbox vocabulary is legal here). Any asset, caption, or copy that could surface on
a Planet Scoria Prime narrative channel routes through reveal-warden first — no
AI-explicit vocabulary reaches pre-reveal narrative surfaces. (§8 above extends this
to ALL player-facing game text.)

**Asset pipeline (locked 2026-07-16):** Grok Build (code) + Grok Imagine (assets)
for this game layer. Higgsfield remains the Scoria-production engine — do not cross
the pipelines.

## 12 — Ratification checklist (Operator) — RATIFIED whole, 2026-07-25 (via Director relay)

- [x] §2 palette (incl. Founder-hex RESERVED rule)
- [x] §5 board registers
- [x] §6 chassis reads (esp. Volt glow wording vs. HITL look-lock)
- [x] §8 reveal fence for game surfaces
- [x] §9 templates as the generation contract

*← [[simbox-index]] · [[anvil-arena-autobattler-design]] · [[scoria-look-bible]]*
