
import { Link } from "react-router-dom";
import SocialIcons from "./SocialIcons";

interface BrandSectionProps {
  description: string;
}

const BrandSection = ({ description }: BrandSectionProps) => {
  return (
    <div className="col-span-1 md:col-span-1">
      <Link to="/" className="inline-block mb-4">
        <span className="font-bold text-xl gradient-text">MindBloom</span>
      </Link>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      <SocialIcons />
    </div>
  );
};

export default BrandSection;
