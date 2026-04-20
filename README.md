# Ludhiana Excellence Coaching (Demo Website)

Static, fast demo website for a coaching/tuition center with:
- Courses list
- Fee structure
- Testimonials (carousel)
- Admission form (client-side validation + opens WhatsApp with prefilled message)
- Floating WhatsApp button
- Light/Dark theme toggle
- Scroll reveal animations

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Update institute details

Edit `script.js`:
- `CONFIG.phoneE164`
- `CONFIG.displayPhone`
- `CONFIG.whatsappNumberE164NoPlus`
- `CONFIG.whatsappDefaultText`

Edit `index.html`:
- Address text
- Map embed (search query in the iframe `src`)

