import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="page-hero-content">
        <span className="eyebrow">Page Not Found</span>
        <h1>This page is not available.</h1>
        <p className="lead">Return to the hospital homepage or use the menu to continue.</p>
        <Link className="button button-primary" href="/">
          Go Home
        </Link>
      </div>
    </section>
  );
}
