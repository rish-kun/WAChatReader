# 📱 WhatsApp Chat Viewer

**WhatsApp Chat Viewer** is a sleek and dynamic web application that allows users to **upload and view exported WhatsApp chat backups** in a clean, modern UI. Designed for easy navigation and a smooth user experience, it helps users explore long conversations with **date-based filtering**, **animated transitions**, and a responsive layout.

---

## 🔍 Key Features

- 📁 Upload `.txt` files exported from WhatsApp (without media)
- 📅 Navigate messages by **date**
- 💬 Beautifully formatted and animated **chat bubbles**
- 🔍 Smooth scrolling and filtering for long conversations
- 💡 Responsive and modern UI with subtle animations

## ⚙️ How It Works

1. Export a WhatsApp chat (without media) from your phone as a `.txt` file.
2. Upload the file using the drag-and-drop or file input component.
3. The app parses each message into:
   - 🕒 Date & Time
   - 👤 Sender
   - 📝 Message content
4. Messages are grouped by date and displayed as chat bubbles.
5. Use the date navigation bar to jump to any day in the conversation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (TypeScript)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Parsing**: Custom JavaScript logic to handle WhatsApp text formats

---

## 📂 Project Structure

