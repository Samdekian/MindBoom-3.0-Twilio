
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface FooterLink {
  to: string;
  label: string;
  highlight?: boolean;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => {
  return (
    <div className="col-span-1">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link 
              to={link.to} 
              className={`text-gray-600 hover:text-therapy-purple ${link.highlight ? 'highlight-link' : ''}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterColumn;
