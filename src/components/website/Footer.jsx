import Image from "next/image";
import Link from "next/link";
import styles from "./WebsiteShell.module.css";

const footerLinks = [
  {
    title: "Academy",
    links: [
      { label: "About", href: "/#about" },
      { label: "Programs", href: "/#programs" },
      { label: "Facilities", href: "/#facilities" },
    ],
  },
  {
    title: "Students",
    links: [
      { label: "Register", href: "/register" },
      { label: "Login", href: "/login" },
      { label: "Packages", href: "/#packages" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.siteFooter}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <Link className={styles.footerLogo} href="/">
            <Image
              src="/images/cst_white.png"
              alt="CST Cricket Academy"
              width={135}
              height={60}
              loading="eager"
              className={styles.logo}
            />
            <span>
              <strong>CST Cricket Academy</strong>
              <small>Professional cricket coaching and player development.</small>
            </span>
          </Link>
          <p>
            Build sharp technique, match confidence, and disciplined routines with
            academy-led cricket training.
          </p>
        </div>

        {footerLinks.map((section) => (
          <div className={styles.footerColumn} key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.footerColumn}>
          <h2>Contact</h2>
          <address>
            <span>CST Cricket Academy</span>
            <span>Open daily for academy sessions</span>
            <Link href="mailto:info@cstcricketacademy.com">
              info@cstcricketacademy.com
            </Link>
          </address>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <span>Copyright {year} CST Cricket Academy. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
