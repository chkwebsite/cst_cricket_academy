"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WebsiteShell.module.css";

const navGroups = [
  {
    label: "Academy",
    items: [
      { label: "About CST", href: "about" },
      { label: "Coaches", href: "coaches" },
      { label: "Facilities", href: "facilities" },
    ],
  },
  {
    label: "Programs",
    items: [
      { label: "Junior Cricket", href: "junior-cricket" },
      { label: "Advanced Coaching", href: "advanced-coaching" },
      { label: "One-to-One Training", href: "personal-training" },
    ],
  },
  {
    label: "Admissions",
    items: [
      { label: "Packages", href: "packages" },
      { label: "Register", href: "/register" },
      { label: "Student Login", href: "/login" },
    ],
  },
];

function DesktopNavItems() {
  return (
    <ul className={`navbar-nav ms-auto mb-3 mb-lg-0 ${styles.navList}`}>
      <li className="nav-item">
        <Link className={styles.navLink} href="/">
          Home
        </Link>
      </li>

      {navGroups.map((group) => (
        <li className="nav-item dropdown" key={group.label}>
          <button
            className={`dropdown-toggle ${styles.navLink} ${styles.dropdownButton}`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {group.label}
          </button>
          <ul className={`dropdown-menu ${styles.dropdownMenu}`}>
            {group.items.map((item) => (
              <li key={item.label}>
                <Link className="dropdown-item" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}

      <li className="nav-item">
        <Link className={styles.navLink} href="contact">
          Contact
        </Link>
      </li>
    </ul>
  );
}

function MobileNavItems({ onNavigate }) {
  return (
    <div className={styles.mobileNavList}>
      <Link className={styles.navLink} href="/" onClick={onNavigate}>
        Home
      </Link>

      {navGroups.map((group) => (
        <div className={styles.mobileNavGroup} key={group.label}>
          <span>{group.label}</span>
          {group.items.map((item) => (
            <Link className={styles.mobileNavSubLink} href={item.href} key={item.label} onClick={onNavigate}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <Link className={styles.navLink} href="contact" onClick={onNavigate}>
        Contact
      </Link>
    </div>
  );
}

function HeaderActions({ onNavigate }) {
  return (
    <div className={styles.headerActions}>
      <Link className={styles.loginLink} href="/login" onClick={onNavigate}>
        Login
      </Link>
      <Link className={styles.ctaLink} href="/register" onClick={onNavigate}>
        Join Now
      </Link>
    </div>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={styles.siteHeader}>
      <div className="container">
        <nav className={`navbar navbar-expand-lg ${styles.navbar}`} aria-label="Primary navigation">
          <Link className={styles.brand} href="/">
            <Image
              src="/images/cst.png"
              alt="CST Cricket Academy"
              width={135}
              height={60}
              priority
              className={styles.logo}
            />
            <span>
              <strong>CST Cricket Academy</strong>
              <small>Train. Compete. Rise.</small>
            </span>
          </Link>

          <button
            className={`navbar-toggler d-lg-none ${styles.toggler}`}
            type="button"
            aria-controls="mobileWebsiteNavbar"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`d-none d-lg-flex ${styles.desktopNav}`}>
            <DesktopNavItems />
            <HeaderActions />
          </div>

          <button
            className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ""}`}
            type="button"
            aria-label="Close navigation"
            tabIndex={isMobileMenuOpen ? 0 : -1}
            onClick={closeMobileMenu}
          />

          <div
            className={`${styles.navDrawer} ${isMobileMenuOpen ? styles.navDrawerOpen : ""}`}
            id="mobileWebsiteNavbar"
            aria-labelledby="websiteNavbarLabel"
            aria-hidden={!isMobileMenuOpen}
          >
            <div className={styles.navDrawerHeader}>
              <Link className={styles.drawerBrand} href="/">
                <Image
                  src="/images/cst.png"
                  alt="CST Cricket Academy"
                  width={135}
                  height={60}
                  className={styles.logo}
                />
                <span id="websiteNavbarLabel">CST Cricket Academy</span>
              </Link>
              <button
                type="button"
                className={`btn-close ${styles.drawerClose}`}
                aria-label="Close"
                onClick={closeMobileMenu}
              />
            </div>

            <div className={styles.navDrawerBody}>
              <MobileNavItems onNavigate={closeMobileMenu} />
              <HeaderActions onNavigate={closeMobileMenu} />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
