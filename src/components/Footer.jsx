export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="footer-brand">
        Chess<span className="logo-dot">.</span>VP
      </div>
      <p className="footer-text">
        © {new Date().getFullYear()} Chess.VP — All rights reserved.
      </p>
    </footer>
  )
}
