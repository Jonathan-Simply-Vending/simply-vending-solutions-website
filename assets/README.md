# Media assets

Drop image or video files into this folder, then open the source file and
**uncomment** the matching `src="assets/..."` line to swap the striped
placeholder for the real media.

Supported formats: **.jpg, .png, .webp** (images) · **.mp4, .webm** (video).
The `<Media>` component auto-detects video vs image from the file extension.

## Where each file goes

### Homepage (`src/home_top.jsx`)
| File | Slot | Recommended ratio |
|---|---|---|
| `hero-lobby.jpg` *or* `hero-lobby.mp4` | Full-bleed hero behind headline | 3:2 landscape, warm light |
| `draft-tap-product.jpg` | "Flagship" product shot | 4:5 portrait |

### Services grid (`src/home_bottom.jsx`)
| File | Slot |
|---|---|
| `service-draft.jpg` | Draft Beverages card (featured, 16:10) |
| `service-micromart.jpg` | Micro Marts card (4:3) |
| `service-coffee.jpg` | Hot Coffee card (4:3) |
| `service-events.jpg` | Events card (4:3) |

### Testimonial (`src/home_bottom.jsx`)
| File | Slot |
|---|---|
| `testimonial-lizz.jpg` | Square headshot, shown as avatar |

### About page (`src/about_contact.jsx`)
| File | Slot |
|---|---|
| `founder-jonathan.jpg` | 4:5 founder portrait |

### Service detail pages (`src/service_page.jsx`)
Each of the four service pages (`draft`, `micromart`, `coffee`, `events`) can
show a hero photo + a 4-image gallery. Name files with the service id as the
prefix:

| File | Slot |
|---|---|
| `draft-hero.jpg` | Draft Beverages page hero (4:5) |
| `draft-gallery-1.jpg` | Gallery, 4:5 |
| `draft-gallery-2.jpg` | Gallery, 1:1 |
| `draft-gallery-3.jpg` | Gallery, 4:3 |
| `draft-gallery-4.jpg` | Gallery, 3:4 |
| `micromart-hero.jpg`, `micromart-gallery-1..4.jpg` | Micro Marts page |
| `coffee-hero.jpg`, `coffee-gallery-1..4.jpg` | Hot Coffee page |
| `events-hero.jpg`, `events-gallery-1..4.jpg` | Events page |

## Using a video instead of an image

Any slot can take a video — just point `src` at a `.mp4` or `.webm`. Videos
autoplay muted on loop (like the hero of most hospitality sites):

```jsx
<Media src="assets/hero-lobby.mp4" kind="video" alt="Lobby at morning" ... />
```

For the hero specifically, an autoplay muted 6–12 second clip reads beautifully.

## Tuning the crop

If a photo is framed so that the important subject sits off-center, pass
`objectPosition` — any CSS object-position value works:

```jsx
<Media src="assets/founder-jonathan.jpg" objectPosition="50% 30%" ... />
```
