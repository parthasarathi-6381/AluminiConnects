import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-auto">
      <p>© {new Date().getFullYear()} Alumni Connect . All rights reserved.</p>
    </footer>
  );
}
