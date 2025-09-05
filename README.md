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
- **BPT Overview:** Real-time business metrics and performance indicators
- **Event Calendar:** Interactive calendar with pharmacy events and appointments
- **Navigation Tabs:** Three main sections (Homepage, On Going Campaign, Monitoring)
- **Quick Actions:** Shortcuts for common pharmacy operations
- **Store Information:** Dynamic display based on user login type

### Design & Branding
- **Apotek Alpro Brand Identity:** Custom logo, colors, and mascot integration
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Modern UI/UX:** Clean, professional interface with smooth animations
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
- Column A: Short Store Name (Outlet Username)
- Column B: Store Name (HQ Username)  
- Column D: AM/Account Manager (Outlet Password)
- Column H: Password (HQ Password)

## 🚀 Quick Start

### Login Credentials (Sample)

**Outlet Login:**
- Store Code: `JKJSTT1`
- Account Manager: `JESIKA SILITONGA`

**HQ Login:**
- Store Name: `APOTEK ALPRO TEBET TIMUR`
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

## 📈 Dashboard Metrics

- **Monthly Revenue:** Real-time revenue tracking
- **Total Transactions:** Daily transaction counts
- **Customer Satisfaction:** Satisfaction percentage
- **Active Products:** Current inventory count

## 🗓️ Calendar Events

Sample events included:
- Health Awareness Campaign (Sep 15)
- Monthly Staff Meeting (Sep 22)
- Inventory Check (Sep 30)

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