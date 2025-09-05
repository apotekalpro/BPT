# Apotek Alpro Web Application

A modern web application for Apotek Alpro pharmacy chain management with dual login system and comprehensive dashboard.

## 🚀 Live Application

**Application URL:** https://3000-iuudf3oj4zth3i27u5dg2-6532622b.e2b.dev

## 🏥 Features

### Authentication System
- **Dual Login Methods:**
  - **Outlet Login:** Uses Store Code (Column A) + Account Manager Name (Column D)
  - **HQ Login:** Uses Store Name (Column B) + Password (Column H)
- **Google Sheets Integration:** Real-time authentication against live spreadsheet data
- **Session Management:** Secure user sessions with proper logout functionality

### Dashboard Features
- **Campaign Calendar 2025:** Complete BPT campaign timeline with visual indicators
- **Organizational Chart:** Carta Organisasi & PIC structure display
- **Contact Information:** Marketing team contact details and creative request form
- **Navigation Tabs:** Four main sections (Homepage, On Going Campaign, Monitoring, Health News)
- **Quick Actions:** Shortcuts for common pharmacy operations
- **Store Information:** Dynamic display based on user login type

### Design & Branding
- **Official Apotek Alpro Logo:** Authentic logo image with professional styling and hover effects
- **Marketing-Focused Design:** Enhanced visuals for marketing and creative teams
- **Gradient Headers:** Professional gradient backgrounds with animations
- **Modern UI/UX:** Premium interface with hover effects and smooth transitions
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Health News Integration:** Full-screen iframe with external health news source
- **Accessibility:** Keyboard shortcuts and screen reader support

## 🔧 Technical Stack

- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Authentication:** Google Sheets API integration
- **Process Management:** PM2 for production deployment
- **Charts:** Chart.js for data visualization
- **Icons:** Font Awesome
- **Fonts:** Inter (Google Fonts)

## 📊 Data Source

The application authenticates users against this Google Sheets:
https://docs.google.com/spreadsheets/d/1wCvZ1WAlHAn-B8UPP5AUEPzQ5Auf84BJFeG48Hlo9wE/edit?gid=0#gid=0

**Column Mapping:**

**Outlet Login Sheet:**
- Column A: Short Store Name (Outlet Username)
- Column D: Password (Outlet Password)

**HQ Login Sheet:**
- Column B: Email (HQ Username)  
- Column H: Password (HQ Password)

## 🚀 Quick Start

### Login Credentials (Sample)

**Outlet Login:**
- Store Code: `JKJSTT1`
- Password: `Alpro@123`

**HQ Login:**
- Email: `eni.khuzaimah@apotekalpro.id`
- Password: `Alpro@123`

### Navigation
- **Homepage:** Dashboard with metrics, calendar, and quick actions
- **On Going Campaign:** Campaign management (under maintenance)
- **Monitoring:** System monitoring (under maintenance)

## ⌨️ Keyboard Shortcuts

### Login Page
- `Alt + O` - Switch to Outlet Login
- `Alt + H` - Switch to HQ Login

### Dashboard
- `Ctrl/Cmd + 1` - Go to Homepage
- `Ctrl/Cmd + 2` - Go to Campaign tab
- `Ctrl/Cmd + 3` - Go to Monitoring tab
- `Ctrl/Cmd + 4` - Go to Health News tab
- `Ctrl/Cmd + R` - Refresh dashboard data
- `Esc` - Close notifications

## 🎨 Brand Elements

### Colors
- **Primary Blue:** #2E5B9F
- **Light Blue:** #4A7BC8
- **Dark Blue:** #1E3F6F
- **Accent Yellow:** #F8C74A
- **Success Green:** #10B981
- **Error Red:** #EF4444

### Logo
- Custom "α" symbol in blue circle
- "alpro" text with "apotek pharmacy" subtitle
- Mascot character: Friendly pharmacist with glasses and lab coat

## 📱 Responsive Breakpoints

- **Desktop:** 1200px and above
- **Tablet:** 768px to 1199px
- **Mobile:** 320px to 767px

## 🔒 Security Features

- Session-based authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention (N/A - uses Google Sheets)
- XSS protection through proper escaping

## 🔧 Development

### Local Development
```bash
npm install
npm run dev
```

### Production Deployment
```bash
npm install
npx pm2 start ecosystem.config.js
```

### PM2 Commands
```bash
npx pm2 status          # Check application status
npx pm2 logs            # View logs
npx pm2 restart all     # Restart application
npx pm2 stop all        # Stop application
npx pm2 delete all      # Delete PM2 processes
```

## 📅 Campaign Calendar 2025

**August 2025:** National Day Sales (GO Jaksel + Bekasi)
**September 2025:** Woman Health & Fitness (GO Jaksel)
**October 2025:** Kenali Gula Anda (GO)
**November 2025:** Kenali Gula Anda (GO)
**December 2025:** Anniversary Year End Sales, Apotek Cilik Experience Day, Apotek Alpro Picasso 2025

## 📞 Marketing Contacts

**Email:** marketing@apotekalpro.id
**Phone:** +62 877 8573 1144
**Creative Requests:** [Artwork Request Form](https://docs.google.com/forms/d/1sqb9qcDQmdJ9e5m_TOrr2VG8z3lqbJW7Ai_aeutcogg/edit)

## 🎨 Visual Enhancements

- **Gradient Animations:** Dynamic gradient headers with smooth animations
- **Hover Effects:** Interactive elements with professional transitions
- **Campaign Status Indicators:** Color-coded status badges for campaigns
- **Card Animations:** Smooth slide-in animations for dashboard cards
- **Modern Typography:** Enhanced font weights and spacing
- **Marketing-Focused Layout:** Optimized for creative and marketing workflows

## 🚧 Future Enhancements

- **Campaign Management:** Full campaign creation and tracking
- **Monitoring Dashboard:** Real-time system monitoring
- **Inventory Management:** Stock tracking and alerts
- **Customer Management:** Customer profiles and history
- **Reporting System:** Advanced analytics and reports
- **Mobile App:** Native mobile applications

## 📞 Support

For technical support or feature requests, please contact the development team.

## 📄 License

This application is proprietary software developed for Apotek Alpro.

---

**Last Updated:** September 5, 2025  
**Version:** 1.0.0  
**Status:** Production Ready 🟢