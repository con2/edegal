# Rewrite of Edegal

Edegal is a web picture gallery application whose focus is serving event photography. It hosts two high volume photo sites:

* Conikuvat.fi - photos from geek conventions in Finland
* Larppikuvat.fi - photos from larps in Finland

## Motivation for rewrite

### The current implementation performs well for visitor users

At conikuvat.fi and larppikuvat.fi, we host tens of thousands of albums and hundreds of thousands of photos. All albums, subalbums and pictures load very fast.

### The photographer UX is needlessly complicated and hard to extend

We currently use the Django admin for photographers. This is unnecessary technical, exposes too much internal detail and makes it hard to implement more refined UI flows for the photographer.

### Developer experience

While the main developer has extensive experience in Python/Django, he now prefers working with TypeScript for better tooling.

Most importantly, we want to move from a Django API + TypeScript SPA approach to a unified Next.js Server Components + Server Actions code base to reduce boilerplate and busywork.

## Main concepts of the data model

### Albums

Attributes:

* slug (mandatory, public) - we use `lower-snake-case` for these
* title (mandatory, public) - visible to users
* body text (optional, public) - Markdown; if set, visible to users
* visibility (mandatory; default public); an enum of
  * public
  * hidden (but accessible via direct URL)
  * private (only accessible to owner and admin)
* is open for subalbums by others (default false)
  * our most common use case is that the photography lead for an event creates the basic album structure for the event and then invites photographers to upload their photos
  * does it take an admin to create the main album for an event? controlled by this flag on the root album
  * needs to be made rather conspicuous in the UI to make sure a conscious decision is made
* event metadata slug (optional, private)
  * This is either a Kompassi Event Management System URL (starts with https://kompassi.eu/…) or a Larpit.fi URL (starts with https://larpit.fi).
  * Do not implement any special handling for this now. Later we will use this to get basic details (such as dates, venue etc) of events from the aforementioned sites without the user having to manually copy & paste them around.
* ordering number (mandatory, default 0) - may be used for manual ordering
* date of event (mandatory, default today) - default order of subalbums, see below

Relations:

* owner (optional, private) - the user who owns this album
* credits (0..N, public) - identifies the photographers and other staff who have contributed to this album and/or hold copyright.
  * Make this a separate table of (photographer_id, is_copyright, description) where `is_copyright` determines whether this person should be credited as copyright holder (usually just one photographer) and `description` is a free text (presented as single line).
* subalbums (0..N, subject to their visibility) - also a `parent` reverse relation
  * by default, subalbums are ordered by (ordering number ascending, date of event descending).
* photos (0..N, public)
* thumbnail (optional, public)

The most important computed property of an album is its path. Albums should have clean paths formed from their ancestry using slashes (eg. `/myevent-2026/studio-photos/photographer1-saturday`). This may need to be cached in the Album table for performance.

### Photographer

A photographer is someone who may be credited as having contributed to an album. Note that this may include other roles than actually operating the shutter; but for simplicity, we call them all photographers.

A photographer has the following:

* display name (mandatory, public)
* email (optional, private)
* introduction text (optional, public)
* links (0..N, public) of (href, title) - for home page, external gallery, social media links etc

## Media storage

The first version may assume local file storage for now. However, reservations should be made for using an S3 compatible object storage in the future instead. Do not implement it for now; however, make architectural choices that make it easy to implement it in the future. (Note that the media hosting will likely not be actual AWS S3; instead, self-hosted or third-party implementations such as SeaweedFS, Garage or RustFS may be used).

The media storage should be organised as follows:

* `pictures/` - original media
* `previews/` - previews are displayed in the picture view. A photo may have multiple preview media (eg. JPEG, AVIF and HEIF); at least one JPEG preview should be present for all photos (but degrade gracefully if it isn't)
* `thumbnails/` - thumbnails are displayed in the album grid.

However, there may be legacy media that does not follow this layout; as long as it is under the media root, it must work.

## User groups, access levels and main use cases

### Visitor

Does not log in (need not be prevented from doing so but has no privileges if logged in).

### Photographer

Logs in with a Kompassi account (OIDC). Photographer privileges are indicated by group membership (eg. `conikuvat-staff`; make name of the group configurable).

Can do anything the visitor can do.

Can create albums.

Can create sub-albums in albums they have created, or in albums designated as open for subalbums by others.

Can upload photos in albums they have created.

Can delete photos in albums owned by them.

Can delete albums owned by them.

Can reorder albums and pictures in an album owned by them.

### Admin

Can do anything visitors and photographers can do but without ownership restrictions.

Can change the owner of an album.

## Main use cases expanded

### As a visitor I want to see photos from an event

The first plan/implement round should concentrate on this use case. The site should look and feel like the current one, save for necessary alterations.

The visitor either opens front page of the site in the browser by URL, or navigates to an album (or a photo) via a link.

Legacy albums and photos from the Django database should be displayed alongside ones in the new tables. The visitor user need not know the difference.

### As a photographer I want to upload photos of an event

We want photographers to upload photos through the same UI as the visitors use. When logged in and having photographer privileges, additional photographer controls are displayed to eg. create sub-albums and upload photos.

Prior to uploading photos, the photographer may need to create one or more albums for it. This should flow naturally so that it causes as little interruption to them as possible.

Uploading photos is initiated from the album that should contain the uploaded photos.

After photos are uploaded, previews and thumbnails for them are generated in the background.

Legacy albums need not be editable in the new UI; we'll link to the Django admin UI for them.

## Technology stack

Let's let go of Django now. For legacy albums, we may interface from Next.js backend code directly with the legacy Django tables as long as we make it optional and logically separated from the new platform.

* TypeScript
* Next.js, React, Server Components, Server Actions
* Node.js (need not work in Vercel, CloudFlare Workers etc. edge implementations for now)
* Prisma (for SQL ORM and migrations)
* Auth.js, Kompassi OIDC
* Bootstrap (NO Tailwind)
* SCSS
* PostgreSQL (18 and up; modern features may be used)
* Kubernetes

## Prior art

In `backend` (`main` branch), there is the current Django backend. The new backend should co-exist in the same database, _in the same schema_ (Prisma is a pain to work with with a schema other than `public`). Old albums will continue to be managed via the old backend's admin UI and will not be migrated at this time.

In `frontend` (`main` branch), there is the current React SPA frontend. Reuse the markup of the current frontend where possible. (We will improve it later)

Also translations from `frontend/src/translations` should be reused where possible. I am particular to this style of implementing the translations where the translated strings live in TypeScript and the type of the English translations object is used to ensure other languages have all necessary keys.

In the `feat/nextjs` branch, there is an earlier, abandoned attempt at converting the frontend to Next.js. It may be consulted for reference, but the new implementation should start from scratch (ie. `create-next-app`)

The adjacent folder `../larpit-fi` represents my current state of the art in frontend development. I am quite happy with the tooling and DX in there, and it may be consulted for reference; though it may be further improved on.

## Hosting

The application will be self-hosted with Kubernetes.

Kubernetes manifests should follow the [Depleten](https://github.com/japsu/depleten) approach: instead of templating YAML with a templating language, write a computer program that generates the manifests in JSON. The Depleten implementation in `../larpit-fi/src/bin/manifest.mts` may be used for reference (though need not be replicated 1:1 - improvements may be made).

## Technical notes

### Prefer progressive enhancement where reasonable possible

However, full operation without browser JavaScript is not expected. For example:

* with JavaScript: the picture view should probably be implemented as a client component for performance and UX, not causing a full navigation when moving to next/prev image or the album view;
* without JavaScript, the picture view should still render correctly, but moving to sibling pictures or the album is allowed to cause a full navigation.

### Clean URLs mean we don't know if it's an album or a picture

Consider a URL like https://conikuvat.fi/desucon-frostbite-2026/kisaajakuvat/ecg-karsinta/dsc-5529.

We do not want to make separate URL patterns for album and picture views as we want to keep the URL as clean as possible.

Hence, when faced with a path such as `/desucon-frostbite-2026/kisaajakuvat/ecg-karsinta/dsc-5529`, we should try the following in order:

1. Is there a Photo with this path?
2. Is there an Album with this path?
3. Is there a legacy Photo (Django tables) with this path?
4. Is there a legacy Album with this path?

### Database traffic should be reduced where possible

Taking into account the previous point, the current implementation returns the API response for the entire album when a single photo is asked for; this makes it possible to show other pictures in that album and the album view without accessing the database again.

This may not be a feasible approach for Next.js, but as a general guideline, browsing an album in order should not make a query (let alone several queries) for each picture accessed.

### No point in putting MediaSpec in the database as was done in the current versien

Instead, just put it in configuration that which scaled media will be created; and put role (original/preview/thumbnail), dimensions and file type enum in Media.

### Database guidelines

We should prefix our tables and types with `v4_` as working in a schema other than `public` is not feasible. Do not use `edegal` in names as I'm not fond of the name and will rename the app at some point.

Table and field names should be `lower_snake_case` (Prisma has good support for mapping them to `lowerCamelCase` in TypeScript).

Use PostgreSQL enums where enums are used.

Feel free to create constraints in the database where relevant, but don't overdo it. Every illegal field combination need not be prevented by constraint, but they can be used where it makes sense.

We won't bother with row level security or fine-grained grants for now. In the future, one reasonable hardening we will do is separating DDL and app users, but that should be left for future improvement. For now, just use one database user for both DDL and the app.
