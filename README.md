# Support AI

Support AI is a Next.js prototype for a compassionate patient support experience. It combines a public landing page with an interactive dashboard for patient conversation, memory support, mood and sleep check-ins, family connection, light entertainment, and caregiver visibility.

## Features

- Public landing page for the Support AI care concept
- Patient support dashboard at `/dashboard`
- Voice-friendly chat and simple health question flows
- Memory companion with family context
- Mood and sleep tracking
- Family portal and caregiver dashboard views
- Caregiver login demo credentials:
  - ID: `caregiver`
  - Password: `support123`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion
- Lucide React icons

## Getting Started
Demo: https://support-ai-git-master-sanjidaakter877s-projects.vercel.app/


## Project Structure

```text
app/
  page.tsx             Landing page
  dashboard/page.tsx   Interactive Support AI dashboard
  layout.tsx           Root layout and metadata
  globals.css          Global styles and Tailwind theme
components/ui/         Reusable UI components
lib/                   Shared utilities
public/                Static assets
```

## Notes

This project is a prototype. The dashboard uses local component state and demo data; it does not currently persist patient records, connect to a backend, or provide clinical decision support. Any medical or wellness content should be reviewed before real-world use.

## License

This project is proprietary and all rights are reserved. See [LICENSE](LICENSE) for details.
