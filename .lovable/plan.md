

# SharePlate — Food Sharing Platform

## Overview
A community food-sharing app where users can post surplus food and claim items nearby, with map-based discovery and user dashboards. Built with Lovable Cloud for auth and database.

## Pages & Features

### 1. Landing Page
- Navigation bar with SharePlate logo, Home, Dashboard, "+ Share Food" button, and auth links
- Hero section with a light blue/gray gradient background, heart icon, headline "Share Food, Build Community," and a CTA button
- Stats bar showing Community Members, Successful Donations, Available Items, and Total Items Shared (pulled from database)
- "How It Works" section with 3 steps: Post Food → Browse & Claim → Pick Up

### 2. Authentication
- Sign up / Log in pages with email & password
- User profiles table storing display name, avatar, and location
- Auto-create profile on signup via database trigger

### 3. Share Food Form (protected route)
- Form fields: food name, description, category (meals, produce, baked goods, etc.), quantity, expiry date, photo upload, pickup location (with map pin selector)
- Store food items in a `food_items` table with status (available, claimed, completed)
- Image upload via Lovable Cloud storage

### 4. Browse Available Food
- Grid of food item cards showing photo, name, category, expiry, distance, and donor info
- Search bar and filters (category, distance, dietary tags)
- Interactive map view (using Leaflet/OpenStreetMap — free, no API key) showing pins for available items
- Click a pin or card to see item details and claim it

### 5. User Dashboard (protected route)
- "My Shared Items" — list of items the user has posted with status indicators
- "My Claims" — items the user has requested to claim
- Activity history / notifications
- Basic profile editing

### 6. Claim Flow
- "Claim" button on item detail opens a confirmation with pickup instructions
- Notify the donor (in-app notification or simple status update)
- Donor marks item as "picked up" to complete the donation

## Database Schema (Lovable Cloud)
- **profiles** — id, user_id, display_name, avatar_url, location_lat, location_lng
- **food_items** — id, donor_id, title, description, category, quantity, expiry_date, image_url, lat, lng, address, status, created_at
- **claims** — id, item_id, claimer_id, status, created_at
- **user_roles** — id, user_id, role (for future admin moderation)

## Design
- Clean, modern look inspired by the screenshot: white background, soft blue accents, rounded cards with subtle shadows
- Primary color: blue (#0EA5E9-ish), with heart icon branding
- Responsive for mobile and desktop
- Lucide icons throughout

## Tech
- React + TypeScript + Tailwind + shadcn/ui
- Lovable Cloud for auth, database, storage
- Leaflet + OpenStreetMap for maps (free)
- RLS policies so users can only edit/delete their own items

