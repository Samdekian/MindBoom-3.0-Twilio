
import { Link } from 'react-router-dom';

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="font-bold text-2xl gradient-text">MindBloom</span>
    </Link>
  );
};

export default NavbarLogo;
