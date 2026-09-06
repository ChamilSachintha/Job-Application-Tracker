# Job Application Tracker 💼

A modern, responsive personal SaaS-style web application to keep track of every job opportunity, company contact info, application progress, interviews, and outcomes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e.svg)

---

## ✨ Features

- **Executive Dashboard**:
  - Dynamic summary metric cards: *Total Applications*, *Applied*, *Interviews*, *Offers*, *Rejected*.
  - **Upcoming Follow-ups Widget**: Highlights approaching follow-ups and flags overdue action items with visual alerts.
  - Quick-filter dashboard cards.
- **Modern Applications Table**:
  - Company avatar/logo with automatic stylized monogram fallback.
  - Position / Job Title with link to original job posting.
  - Direct company links (Website, LinkedIn, Facebook, Social) opening in a new tab.
  - Clickable `mailto:` email address.
  - Formatted application date.
  - Visually distinct status badges across all 14 lifecycle stages:
    - *Interested*, *Applied*, *Application Viewed*, *Replied*, *HR Call*, *Interview Scheduled*, *Interview Completed*, *Assignment Received*, *Assignment Submitted*, *Final Interview*, *Offer Received*, *Rejected*, *Withdrawn*, *No Response*.
  - Relative "Last Updated" timestamp (e.g. *Just now*, *2h ago*, *Yesterday*).
  - Clean 3-dot dropdown menu for **View Details**, **Edit**, and **Delete**.
- **Search, Filter & Sorting**:
  - Instant text search across Company Name, Position, and Applied Email.
  - Dropdown filters for Status, Application Source, Applied Date, and Interview Date.
  - Single-click **Clear Filters** reset button.
  - Multi-column sortable table headers (Company, Applied Date, Status, Last Updated).
- **Comprehensive Add / Edit Application Drawer / Modal**:
  - **Company Information**: Name, Position, Website, LinkedIn, Facebook, Other Social, Logo URL.
  - **Application Information**: Email, Source (LinkedIn, Website, Email, WhatsApp, Referral, Recruiter, Other), Job Posting URL, Applied Date, Status.
  - **Interview Information**: Date, Time, Type (Phone, Online, On-site), Meeting Link, Location, Interviewer / Contact Person.
  - **Additional Information**: Expected Salary, Offered Salary, Follow-up Date, Notes.
- **Detailed Application View & Interactive Timeline**:
  - Dedicated side drawer displaying all opportunity specifics.
  - Quick status changer right in the header.
  - **Application Timeline**: Automatically records chronological entries whenever a status changes, plus manual activity logging for:
    - *Received email*, *Phone call*, *Followed up*, *Interview*, *Assignment*, *Personal note*, *Other*.
- **Confirmation Modals & Feedback**:
  - Delete confirmation dialog before permanently removing an application.
  - Toast notifications for create, update, delete, and status change actions.
- **Dual-Mode Persistence**:
  - Seamlessly integrates with **Supabase** via PostgreSQL database and RLS policies.
  - Automatically falls back to persistent **Local Storage** with starter sample data if Supabase credentials are not configured yet, allowing instant testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React + Brand SVG icons
- **Database & Backend**: Supabase (PostgreSQL, Row Level Security, Triggers)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ChamilSachintha/Job-Application-Tracker.git
cd "Job-Application-Tracker"
npm install
```

### 2. Configure Supabase (Optional)

The application works immediately in **Local Storage Mode** out of the box with realistic starter data.

To connect your own **Supabase** database:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script in `supabase/schema.sql`.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 📄 Database Schema (`supabase/schema.sql`)

- `applications`: Main table containing all application fields, salary, interview, and social links.
- `application_activities`: Foreign-key linked timeline activities with automatic trigger on status change.
- `handle_updated_at`: Trigger maintaining `updated_at` timestamps on row modification.
- Row Level Security (RLS) policies enabled.
