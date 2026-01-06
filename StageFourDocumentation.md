# 🚗 MAZAADY - Car Auction Platform

An **online live auction** platform for buying and selling used cars easily and securely — no need to visit showrooms!  
The platform ensures **trust**, **transparency**, and **a complete digital experience** for all parties.

---

## STAGE 4:

## Break down user stories into smaller tasks or features.
###  MUST HAVE :
👤 Guest Browsing Auctions
🧾 User Story

As a guest, I want to browse active auctions so that I can explore items before signing up.

🖥️ Homepage Structure
🔹 Navigation Bar

Site logo

Navigation links

Create Account button

Login button

🔹 Hero Section

Full-page background image or logo

Short platform description

🔹 Active Auctions Preview

Auction cards

Button to view all active auctions

🔹 Platform Statistics

Active auctions

Registered users

Total bids

Number of cars/items

Total bid amount

🔹 Features Showcase

Visually highlighted platform features

🔹 Developers Section

Developer names

Contact information

🔹 Footer

Page links

Site logo

Copyright

🔍 Auction Details (Guest View)
🧾 User Story

As a guest, I want to view auction details so that I can understand the item, price, and time remaining.

🎭 Persona

User Type: Guest

Context: Browsing without authentication

🎯 User Goal

Guests should be able to:

Understand the item

View the current price

Track remaining auction time

⚙️ Functional Requirements
🧱 Item Details

Title

Description

Images

Category

💰 Auction Information

Starting price

Current highest bid

Bid increment

Number of bids

⏱️ Time Information

End date & time

Live countdown timer

Status:

Active

Ended

🚫 Guest Restrictions

View-only access

Cannot:

Place bids

Comment

Purchase items

🔐 User Registration & Login
🧾 User Story

As a user, I want to register/login securely so that I can participate in auctions.

🎭 Persona

User Type: Registered / Returning user

Context: Wants to interact with auctions

⚙️ Functional Requirements
📝 Registration

Roles:

Buyer

Seller

Methods:

Email & password

Google login

Required fields:

Name

Phone

Email

Password

Password confirmation

🔑 Login

Email + password

Error handling:

Invalid credentials

Inactive/unverified accounts

🔒 Security

Password hashing & salting

JWT or server-side sessions

CSRF protection

🔁 Access Control

Logged-in users can bid & track activity

Guests redirected to login for restricted actions

⚡ Real-Time Bid Updates
🧾 User Story

As a user, I want to see bid updates in real time so that I don’t have to refresh the page.

⚙️ Functional Requirements
🔄 Live Updates

Highest bid updates instantly

Bid count updates

Anonymous bidder IDs

⏳ Auction Status

Active → Ending Soon

Active → Ended

Automatic closure at end time

🕒 Countdown Timer

Real-time synchronized timer

Same remaining time for all users

🧪 Technology

WebSockets / SSE / Real-time service

📊 Bidding History
🧾 User Story

As a user, I want to view my bidding history so that I can track my activity.

⚙️ Functional Requirements
📜 History Records

Each entry includes:

Auction name

Auction ID

Bid amount

Date & time

Status:

Active

Won

Lost

Ended

🔎 Filtering & Sorting

Filter:

Active

Ended

Won

Sort:

Date

Bid amount

🔐 Access Control

Only visible to the owner

Guests redirected to login

🏷️ Seller Creates Auctions
🧾 User Story

As a seller, I want to create auctions so that I can sell items.

⚙️ Functional Requirements
🧾 Auction Creation

Title

Description

Starting bid

Bid increment (optional)

Start & end dates

📷 Photo Upload

JPG / PNG

Size & count limits

Preview before submit

✔️ Validation

Minimum bid > 0

End date after start date

Required fields enforced

🗂️ Management

Save as draft

Publish auction

Edit only before start

🛡️ Admin System Monitoring
🧾 User Story

As an admin, I want to monitor system activity so that the platform remains safe and controlled.

⚙️ Functional Requirements
📈 Monitoring Dashboard

User activity

Auction lifecycle

Bidding volume

🧾 Logs & Audits

User actions

Admin actions

System events

Searchable & filterable

🔐 Access Control

Admin-only access

Role-based permissions

###  SHOULD HAVE :
💎 Paid Membership Upgrade
🧾 User Story

As a user, I want to upgrade to a paid membership so that I can increase my bid limits.

⚙️ Functional Requirements

View membership plans

Secure payment processing

Automatic bid limit increase

Membership status & expiration

Renewal & downgrade options

###  COULD HAVE :
✏️ Seller Edits Auction Before Approval
🧾 User Story

As a seller, I want to edit my auction before approval so that I can correct mistakes.

⚙️ Functional Requirements

Auctions saved as Pending

Editable fields:

Title

Description

Images

Pricing

Duration

👀 Review Page

Read-only preview

Highlight missing fields

Actions:

Edit

Submit for approval

🔒 Approval Rules

Editing locked after approval

No changes once bidding starts

Seller notified of approval/rejection

📩 Outbid Notifications
🧾 User Story

As a user, I want to receive email notifications when I’m outbid so that I don’t miss bidding opportunities.

⚙️ Functional Requirements

Detect outbid events

Notify affected user

Email delivery

Enable/disable notifications

Prevent duplicate alerts

Immediate delivery

###  WON’T HAVE :
- As a user, I want a live chat system with sellers so that I can ask questions.
- As a user, I want AI-based price predictions so that I know if an item is overpriced.
- As an admin, I want advanced analytics dashboards.

---