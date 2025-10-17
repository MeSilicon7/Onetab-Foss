# OneTab FOSS

An open-source alternative to OneTab - Save and manage your browser tabs efficiently.

## 🌟 Features

- **Save All Tabs**: Convert all your open tabs into a list with one click
- **Tab Groups**: Organize saved tabs by time/session
- **Restore Tabs**: Open individual tabs or entire groups
- **Edit Groups**: Rename groups for better organization
- **Delete Management**: Remove individual tabs or entire groups
- **Facebook-Inspired UI**: Clean, modern interface with Facebook's color scheme
- **Privacy First**: All data stored locally in your browser
- **Firefox Optimized**: Built specifically for Firefox with Manifest V3

## 🎨 Design

The extension features a Facebook-inspired color scheme:
- Primary Blue: #1877f2
- Clean white surfaces
- Subtle shadows and borders
- Modern, responsive design

## 🚀 Installation

### For Users

1. Download the latest release from the [Releases page](../../releases)
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extracted folder

### For Developers

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/Onetab-Foss.git
   cd Onetab-Foss
   ```

2. Load the extension in Firefox:
   - Open Firefox
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Navigate to the project folder and select `manifest.json`

## 📖 Usage

1. **Save Tabs**: Click the extension icon and press "Save All Tabs" button
2. **Restore Tab**: Click on any saved tab title to open it
3. **Restore Group**: Click the restore icon on a group to open all tabs
4. **Edit Group Name**: Click the edit icon to rename a group
5. **Delete**: Use the delete icons to remove tabs or groups
6. **Context Menu**: Right-click anywhere and select "Save All Tabs"

## 🏗️ Project Structure

```
Onetab-Foss/
├── manifest.json           # Extension manifest (Manifest V3)
├── src/
│   ├── background/
│   │   └── background.js   # Background service worker
│   ├── popup/
│   │   ├── popup.html      # Popup UI
│   │   ├── popup.css       # Styles (Facebook theme)
│   │   └── popup.js        # Popup logic
│   └── utils/
│       └── storage.js      # Storage utilities
├── icons/                  # Extension icons (add your icons here)
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-96.png
├── LICENSE                 # MIT License
└── README.md              # This file
```

## 🔧 Technical Details

- **Manifest Version**: V3
- **Browser**: Firefox 109.0+
- **Permissions**: `tabs`, `storage`
- **Storage**: Uses `browser.storage.local` API
- **No external dependencies**: Pure vanilla JavaScript

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original OneTab extension
- Facebook for the color scheme inspiration
- Mozilla for excellent WebExtension documentation

## 🐛 Known Issues

- Icons need to be added (placeholder references in manifest.json)
- Advanced features like export/import coming soon

## 🗺️ Roadmap

- [ ] Add extension icons
- [ ] Export/Import functionality
- [ ] Search within saved tabs
- [ ] Dark mode support
- [ ] Statistics and analytics
- [ ] Cloud sync (optional)
- [ ] Chrome/Edge compatibility

## 📧 Contact

Project Link: [https://github.com/yourusername/Onetab-Foss](https://github.com/yourusername/Onetab-Foss)

---

**Note**: This is an independent open-source project and is not affiliated with the original OneTab extension.
