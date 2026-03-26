# Contengement 📺
A modern content management Electron app for organizing and managing visual projects, scripts, and assets.

## ⚡ Quick Start for End Users

### Download & Install
1. **Download** the latest installer from [Releases](../../releases)
2. **Run** the `.exe` installer
3. **Launch** Contengement from your Start Menu

That's it! No command line needed.

---

## 👨‍💻 For Developers & Contributors

### Prerequisites
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/swayanshubi/contengement.git
   cd contengement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run electron:dev
   ```
   This will start the Next.js dev server and open the Electron app with hot-reload.

### Build & Distribution

**For Windows Distribution (.exe installer):**
```bash
npm run electron:dist
```
The installer will be generated in the `release/` folder.

**For Web Version Only:**
```bash
npm run dev
```
Then open `http://localhost:3000` in your browser.

**For Production Build:**
```bash
npm run build
npm run electron:start
```

---

## 🛠 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build Next.js app for production |
| `npm run start` | Start Next.js production server |
| `npm run electron:dev` | Run Electron app in dev mode |
| `npm run electron:start` | Run built Electron app |
| `npm run electron:dist` | Build Windows installer |
| `npm run lint` | Run ESLint |

---

## 📋 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Desktop**: Electron 37
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build**: electron-builder

---

## 📁 Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
│   ├── editor/      # Main editor UI components
│   ├── shell/       # Desktop shell components
│   └── ui/          # Reusable UI components
├── lib/             # Utilities & database logic
└── types/           # TypeScript definitions

electron/           # Electron main process
├── main.cjs        # Main process entry
├── preload.cjs     # Preload script for IPC
└── dev-runner.cjs  # Dev mode runner
```

---

## 🐛 Troubleshooting

**Build failing?**
- Clear cache: `rm -r node_modules package-lock.json && npm install`
- Ensure Node.js version: `node --version` (should be 18+)

**Port 3000 already in use?**
- Change port: `PORT=3001 npm run dev`

**Electron won't start?**
- Check logs in the terminal for specific errors
- Ensure `.next` folder exists: `npm run build`

---

## 📝 License
See LICENSE file for details.

---

## 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Questions?** Open an issue on GitHub!
